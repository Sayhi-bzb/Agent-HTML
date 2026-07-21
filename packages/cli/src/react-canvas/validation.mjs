import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  CANVAS_POLICY_VERSION,
  canvasDiagnosticCodes,
  canvasRuntimeProviderMatchesCatalog,
  canvasWorkspaceDependenciesMatchCatalog
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

export async function validateCanvasSources({ root }) {
  const [artifacts, implementationSources] = await Promise.all([
    discoverReactArtifacts(root),
    discoverReactImplementationSources(root)
  ])
  const artifactDiagnostics = await Promise.all(
    artifacts.map(async (filePath) =>
      validateArtifactEntry({
        filePath: workspaceRelativePath(root, filePath),
        source: await readTextFile(filePath)
      })
    )
  )
  const implementationDiagnostics = await Promise.all(
    implementationSources.map(async (filePath) =>
      validateBlockImplementation({
        filePath: workspaceRelativePath(root, filePath),
        source: await readTextFile(filePath)
      })
    )
  )
  return {
    artifacts,
    implementationSources,
    diagnostics: [...artifactDiagnostics, ...implementationDiagnostics].flat()
  }
}

function manifestDiagnostic({ filePath, message }) {
  return {
    category: "manifest",
    code: canvasDiagnosticCodes.manifestDrift,
    column: 1,
    filePath,
    line: 1,
    message,
    policyVersion: CANVAS_POLICY_VERSION,
    suggestion: "Use the 0.3 Canvas template and synchronize runtime manifests."
  }
}

export async function validateRuntimeCatalog({ root }) {
  const canvasPath = path.join(root, "agent-html", "package.json")
  const cliPath = path.join(packageRoot, "package.json")
  const [canvasManifest, cliManifest] = await Promise.all(
    [canvasPath, cliPath].map(async (filePath) =>
      JSON.parse(await fs.readFile(filePath, "utf8"))
    )
  )
  const diagnostics = []
  if (!canvasWorkspaceDependenciesMatchCatalog(canvasManifest.dependencies)) {
    diagnostics.push(
      manifestDiagnostic({
        filePath: "agent-html/package.json",
        message: "Canvas dependency metadata differs from the Kernel runtime catalog."
      })
    )
  }
  if (!canvasRuntimeProviderMatchesCatalog(cliManifest.dependencies)) {
    diagnostics.push(
      manifestDiagnostic({
        filePath: "packages/cli/package.json",
        message: "CLI runtime dependencies differ from the Kernel runtime catalog."
      })
    )
  }
  return diagnostics
}

export async function validateCanvasWorkspace({ root }) {
  const [sourceReport, manifestDiagnostics] = await Promise.all([
    validateCanvasSources({ root }),
    validateRuntimeCatalog({ root })
  ])
  return {
    ...sourceReport,
    diagnostics: [...sourceReport.diagnostics, ...manifestDiagnostics]
  }
}

export async function runValidateCommand({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const report = await validateCanvasWorkspace({ root })
  if (report.diagnostics.length === 0) {
    console.log(
      `Canvas validation passed ${report.artifacts.length} artifact(s), ${report.implementationSources.length} implementation source(s), policy v${CANVAS_POLICY_VERSION}.`
    )
    return { diagnosticCount: 0 }
  }
  for (const diagnostic of report.diagnostics) {
    console.log(
      [
        `ERROR ${diagnostic.code} ${diagnostic.filePath}:${diagnostic.line}:${diagnostic.column}`,
        diagnostic.message,
        diagnostic.suggestion ? `Fix: ${diagnostic.suggestion}` : null,
        ""
      ]
        .filter(Boolean)
        .join("\n")
    )
  }
  return { diagnosticCount: report.diagnostics.length }
}
