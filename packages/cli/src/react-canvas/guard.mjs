import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  CANVAS_POLICY_VERSION,
  canvasDiagnosticCodes,
  canvasRuntimeCatalog
} from "@agent-html/kernel"
import {
  validateArtifactEntry,
  validateBlockImplementation
} from "@agent-html/kernel/validate"

import {
  discoverReactArtifacts,
  discoverReactImplementationSources,
  parseRootArg,
  workspaceRelativePath
} from "./paths.mjs"
import { readTextFile } from "./workspace-file.mjs"

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

export const reactCanvasGuardScopes = Object.freeze({
  artifactEntryProtocol: "artifact-entry-protocol",
  blockImplementationSource: "block-implementation-source",
  workspaceBoundary: "workspace-boundary"
})

function guardScopeFor(issue, fallback) {
  return issue.category === "workspace"
    ? reactCanvasGuardScopes.workspaceBoundary
    : fallback
}

function asGuardIssue(issue, fallbackScope) {
  return {
    ...issue,
    guardScope: guardScopeFor(issue, fallbackScope),
    severity: "error"
  }
}

export function analyzeReactCanvasArtifact({ relativePath, source }) {
  return validateArtifactEntry({ filePath: relativePath, source }).map((issue) =>
    asGuardIssue(issue, reactCanvasGuardScopes.artifactEntryProtocol)
  )
}

export function analyzeBlockImplementationSource({ relativePath, source }) {
  return validateBlockImplementation({ filePath: relativePath, source }).map((issue) =>
    asGuardIssue(issue, reactCanvasGuardScopes.blockImplementationSource)
  )
}

export function analyzeWorkspaceBoundarySource({ relativePath, source }) {
  return analyzeBlockImplementationSource({ relativePath, source }).filter(
    (issue) => issue.category === "workspace"
  )
}

export function analyzeReactCanvasSourceBoundary({ relativePath, source }) {
  return analyzeBlockImplementationSource({ relativePath, source })
}

export async function runGuard({ root }) {
  const [artifacts, implementationSources] = await Promise.all([
    discoverReactArtifacts(root),
    discoverReactImplementationSources(root)
  ])
  const artifactIssues = await Promise.all(
    artifacts.map(async (filePath) =>
      analyzeReactCanvasArtifact({
        relativePath: workspaceRelativePath(root, filePath),
        source: await readTextFile(filePath)
      })
    )
  )
  const blockIssues = await Promise.all(
    implementationSources.map(async (filePath) =>
      analyzeBlockImplementationSource({
        relativePath: workspaceRelativePath(root, filePath),
        source: await readTextFile(filePath)
      })
    )
  )
  return {
    artifacts,
    implementationSources,
    issues: [...artifactIssues, ...blockIssues].flat()
  }
}

function manifestDiagnostic({ filePath, message }) {
  return asGuardIssue(
    {
      category: "manifest",
      code: canvasDiagnosticCodes.manifestDrift,
      column: 1,
      filePath,
      line: 1,
      message,
      policyVersion: CANVAS_POLICY_VERSION,
      suggestion: "Run npm run canvas:catalog:sync and commit the generated manifests."
    },
    reactCanvasGuardScopes.workspaceBoundary
  )
}

function dependencyEntries(manifest) {
  return Object.fromEntries(
    Object.entries(manifest.dependencies ?? {}).sort(([left], [right]) =>
      left.localeCompare(right)
    )
  )
}

export async function validateRuntimeCatalog({ root }) {
  const canvasPath = path.join(root, "agent-html", "package.json")
  const cliPath = path.join(packageRoot, "package.json")
  const [canvasManifest, cliManifest] = await Promise.all(
    [canvasPath, cliPath].map(async (filePath) =>
      JSON.parse(await fs.readFile(filePath, "utf8"))
    )
  )
  const expected = JSON.stringify(dependencyEntries({ dependencies: canvasRuntimeCatalog }))
  const actualCanvas = JSON.stringify(dependencyEntries(canvasManifest))
  const issues = []
  if (actualCanvas !== expected) {
    issues.push(
      manifestDiagnostic({
        filePath: "agent-html/package.json",
        message: "Canvas dependency metadata differs from the Kernel runtime catalog."
      })
    )
  }
  for (const [dependency, version] of Object.entries(canvasRuntimeCatalog)) {
    if (cliManifest.dependencies?.[dependency] === version) continue
    issues.push(
      manifestDiagnostic({
        filePath: "packages/cli/package.json",
        message: `CLI runtime dependency ${dependency} must be ${version}.`
      })
    )
  }
  return issues
}

export async function runCanvasValidation({ root }) {
  const [guard, manifestIssues] = await Promise.all([
    runGuard({ root }),
    validateRuntimeCatalog({ root })
  ])
  return {
    ...guard,
    issues: [...guard.issues, ...manifestIssues]
  }
}

export async function runValidateCommand({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const report = await runCanvasValidation({ root })
  if (report.issues.length === 0) {
    console.log(
      `Canvas validation passed ${report.artifacts.length} artifact(s), ${report.implementationSources.length} implementation source(s), policy v${CANVAS_POLICY_VERSION}.`
    )
    return { issueCount: 0 }
  }
  for (const issue of report.issues) {
    console.log(
      [
        `ERROR ${issue.code} ${issue.filePath}:${issue.line}:${issue.column}`,
        issue.message,
        issue.suggestion ? `Fix: ${issue.suggestion}` : null,
        ""
      ]
        .filter(Boolean)
        .join("\n")
    )
  }
  return { issueCount: report.issues.length }
}
