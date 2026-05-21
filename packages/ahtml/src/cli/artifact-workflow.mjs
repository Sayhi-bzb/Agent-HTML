import { readFile } from "node:fs/promises"
import path from "node:path"

import { cliDefaults } from "../config/defaults.mjs"
import { getCliSchemaOutput } from "./schema.mjs"
import { buildRuntimeArtifact } from "./runtime-build.mjs"
import {
  bootstrapManagedRuntime,
  ensureRuntimeBuildLock,
  getRuntimeStatus,
  withRuntimeBuildLock,
  writeGeneratedDocument,
  writeGeneratedRuntimeState,
} from "./runtime-status.mjs"
import { nativeRuntimeSetup, resolveRuntimeSetup } from "./runtime-setup.mjs"
import {
  assertRendererSpecParity,
  assertVerificationDataParity,
  getRuntimeRenderDiagnostics,
  readRuntimeVerificationState,
} from "./runtime-renderability.mjs"
import { validateAgentHtmlSource } from "./validate.mjs"
import { parseJson, printDiagnostics, writeJsonFile } from "./cli-io.mjs"

export class ArtifactWorkflowValidationError extends Error {
  constructor(message, diagnostics) {
    super(message)
    this.name = "ArtifactWorkflowValidationError"
    this.diagnostics = diagnostics
  }
}

export class ArtifactWorkflowOutputPathError extends Error {
  constructor(message) {
    super(message)
    this.name = "ArtifactWorkflowOutputPathError"
  }
}

function hasErrorDiagnostics(diagnostics = []) {
  return diagnostics.some((diagnostic) => diagnostic.severity === "error")
}

export function isRuntimeVerificationCurrent({
  runtimeVerificationState,
  schema,
}) {
  assertVerificationDataParity({
    actual: runtimeVerificationState.verificationData,
    actualName: "runtime verification data",
    expected: schema.verificationData,
    expectedName: "schema verification data",
  })
  assertRendererSpecParity({
    actual: runtimeVerificationState.rendererMapping,
    actualName: "runtime renderer verification mapping",
    expected: schema.rendererMapping,
    expectedName: "schema renderer mapping",
  })

  return true
}

export function createArtifactWorkflow({
  userRoot,
  defaultOutputDir,
  packageRoot,
  runtimePaths,
  readPackageVersion,
}) {
  async function prepareDocumentRuntime(inputPath, options = {}) {
    const inputFilePath = path.resolve(userRoot, inputPath)
    const source = await readFile(inputFilePath, "utf8")
    const validation = await validateAgentHtmlSource(source, runtimePaths)

    if (hasErrorDiagnostics(validation.diagnostics)) {
      if (options.printDiagnostics !== false) {
        printDiagnostics(validation.diagnostics)
      }
      return createRuntimePreparationResult({
        diagnostics: validation.diagnostics,
        inputPath: inputFilePath,
        ok: false,
        stage: "validation",
      })
    }

    const packageVersion = await readPackageVersion()
    const schema = await getCliSchemaOutput()
    await ensureManagedRuntime(packageVersion, schema)
    const runtimeDiagnostics = await getRuntimeRenderDiagnostics({
      document: validation.document,
      runtimePaths,
      schema,
    })

    if (runtimeDiagnostics.length > 0) {
      if (options.printDiagnostics !== false) {
        printDiagnostics(runtimeDiagnostics)
      }
      return createRuntimePreparationResult({
        diagnostics: runtimeDiagnostics,
        inputPath: inputFilePath,
        ok: false,
        stage: "runtime-renderability",
      })
    }

    return createRuntimePreparationResult({
      diagnostics: validation.diagnostics,
      inputPath: inputFilePath,
      inspection: createInspection(validation.document),
      document: validation.document,
      ok: true,
    })
  }

  async function buildArtifact(inputPath, outputPath, options = {}) {
    const inputFilePath = path.resolve(userRoot, inputPath)
    const outputDir = path.resolve(userRoot, outputPath ?? defaultOutputDir)
    assertSafeOutputDirectory({
      inputFilePath,
      outputDir,
      userRoot,
    })
    const prepared = await prepareDocumentRuntime(inputPath, options)

    if (!prepared.ok) {
      return createBuildResult({
        diagnostics: prepared.diagnostics,
        inputPath: prepared.inputPath,
        ok: false,
        outputDir,
        stage: prepared.stage,
      })
    }

    await withRuntimeBuildLock(runtimePaths, async () => {
      await writeGeneratedDocument(prepared.document, runtimePaths)
      await writeGeneratedRuntimeState(
        createDocumentRuntimeState(prepared.document),
        runtimePaths,
      )

      await buildRuntimeArtifact({
        outputDir,
        packageRoot,
        paths: runtimePaths,
      })
    })
    const inspection = prepared.inspection
    const inspectionPath = path.join(outputDir, "agent-html.inspect.json")
    await writeJsonFile(inspectionPath, inspection)
    return createBuildResult({
      diagnostics: prepared.diagnostics,
      inputPath: prepared.inputPath,
      inspection,
      inspectionPath,
      ok: true,
      outputDir,
    })
  }

  async function ensureManagedRuntime(packageVersion, schema) {
    const status = await getRuntimeStatus({
      packageVersion,
      outputDir: defaultOutputDir,
      paths: runtimePaths,
    })

    if (status.ready && (await isManagedRuntimeCurrent(schema))) {
      return
    }

    await ensureRuntimeBuildLock(runtimePaths, async () => {
      const refreshedStatus = await getRuntimeStatus({
        packageVersion,
        outputDir: defaultOutputDir,
        paths: runtimePaths,
      })

      if (
        refreshedStatus.ready &&
        (await isManagedRuntimeCurrent(schema))
      ) {
        return
      }

      await bootstrapManagedRuntime({
        packageRoot,
        packageVersion,
        paths: runtimePaths,
        setup: await resolveRuntimeSetup({
          options: {
            ui: nativeRuntimeSetup.uiLibrary,
            "component-source": nativeRuntimeSetup.componentSource,
            preset: nativeRuntimeSetup.preset,
            components: nativeRuntimeSetup.components,
            yes: true,
          },
          interactive: false,
        }),
        schema: schema ?? (await getCliSchemaOutput()),
      })
    })
  }

  async function isManagedRuntimeCurrent(schema) {
    try {
      const runtimeVerificationState =
        await readRuntimeVerificationState(runtimePaths)
      return isRuntimeVerificationCurrent({
        runtimeVerificationState,
        schema,
      })
    } catch {
      return false
    }
  }

  async function inspectDocument(inputPath) {
    const source = await readFile(path.resolve(userRoot, inputPath), "utf8")
    const validation = await validateAgentHtmlSource(source, runtimePaths)

    if (hasErrorDiagnostics(validation.diagnostics)) {
      throw new ArtifactWorkflowValidationError(
        "Cannot inspect an invalid agent-html document.",
        validation.diagnostics,
      )
    }

    return createInspection(validation.document)
  }

  async function inspectArtifactDir(dirPath) {
    const metadataPath = path.join(
      path.resolve(userRoot, dirPath),
      "agent-html.inspect.json",
    )
    const source = await readFile(metadataPath, "utf8")
    return parseJson(source, "agent-html.inspect.json must be valid JSON.")
  }

  async function validateDocument(inputPath, options = {}) {
    const inputFilePath = path.resolve(userRoot, inputPath)
    const source = await readFile(inputFilePath, "utf8")
    const validation = await validateAgentHtmlSource(source, runtimePaths)

    if (hasErrorDiagnostics(validation.diagnostics)) {
      if (options.printDiagnostics !== false) {
        printDiagnostics(validation.diagnostics)
      }
      return createValidationResult({
        diagnostics: validation.diagnostics,
        inputPath: inputFilePath,
        ok: false,
      })
    }

    return createValidationResult({
      diagnostics: validation.diagnostics,
      inputPath: inputFilePath,
      inspection: createInspection(validation.document),
      ok: true,
    })
  }

  return {
    buildArtifact,
    ensureManagedRuntime,
    isManagedRuntimeCurrent,
    inspectArtifactDir,
    inspectDocument,
    prepareDocumentRuntime,
    validateDocument,
  }
}

export function createDocumentRuntimeState(document) {
  return {
    kind: "ahtml-runtime-state",
    version: 1,
    mode: "document",
    artifactProfileReference: document.meta.artifactProfileReference,
    artifactProfile: document.meta.artifactProfile,
    document,
  }
}

export function createInspection(document) {
  if (!document) {
    throw new Error("Cannot inspect an invalid agent-html document.")
  }

  const { artifactProfileReference } = document.meta

  return {
    kind: "agent-html-inspection",
    configModel: "artifact-profile-reference",
    config: {
      artifactProfileReference,
    },
    components: countComponents(document.components),
  }
}

function createBuildResult({
  diagnostics = [],
  inputPath,
  inspection,
  inspectionPath,
  ok,
  outputDir,
  stage,
}) {
  return {
    kind: "agent-html-build-result",
    version: 1,
    ok,
    inputPath,
    outputDir,
    ...(inspection ? { inspection, inspectionPath } : {}),
    ...(diagnostics.length > 0 ? { diagnostics, stage } : {}),
  }
}

function createValidationResult({
  diagnostics = [],
  inputPath,
  inspection,
  ok,
}) {
  return {
    kind: "agent-html-validation-result",
    version: 1,
    ok,
    inputPath,
    ...(inspection ? { inspection } : {}),
    ...(diagnostics.length > 0 ? { diagnostics } : {}),
  }
}

function createRuntimePreparationResult({
  diagnostics = [],
  document,
  inputPath,
  inspection,
  ok,
  stage,
}) {
  return {
    kind: "agent-html-runtime-preparation",
    version: 1,
    ok,
    inputPath,
    ...(document ? { document, inspection } : {}),
    ...(diagnostics.length > 0 ? { diagnostics } : {}),
    ...(stage ? { stage } : {}),
  }
}

export function formatInspectionSummary(inspection) {
  const lines = [
    "agent-html inspection",
    ...(inspection.configModel
      ? [`config model: ${inspection.configModel}`]
      : []),
    ...Object.entries(inspection.config).map(
      ([key, value]) => `${key}: ${value}`,
    ),
    "components:",
  ]

  if (inspection.components.length === 0) {
    lines.push("- none")
  } else {
    for (const component of inspection.components) {
      lines.push(`- ${component.name}: ${component.count}`)
    }
  }

  return `${lines.join("\n")}\n`
}

function countComponents(nodes, counts = {}) {
  for (const node of nodes) {
    if (node.type !== "component") {
      continue
    }

    counts[node.name] = (counts[node.name] ?? 0) + 1
    countComponents(node.children, counts)
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => left.name.localeCompare(right.name))
}

export function assertSafeOutputDirectory({
  inputFilePath,
  outputDir,
  userRoot,
}) {
  const resolvedUserRoot = path.resolve(userRoot)
  const resolvedOutputDir = path.resolve(outputDir)
  const resolvedInputFilePath = path.resolve(inputFilePath)
  const inputParentDir = path.dirname(resolvedInputFilePath)
  const filesystemRoot = path.parse(resolvedOutputDir).root

  if (resolvedOutputDir === filesystemRoot) {
    throw new ArtifactWorkflowOutputPathError(
      `Refusing to use filesystem root as build output: ${resolvedOutputDir}. Choose a dedicated child directory.`,
    )
  }

  if (resolvedOutputDir === resolvedUserRoot) {
    throw new ArtifactWorkflowOutputPathError(
      `Refusing to use project root as build output: ${resolvedOutputDir}. Choose a child directory such as "${cliDefaults.outputDir}".`,
    )
  }

  if (resolvedOutputDir === resolvedInputFilePath) {
    throw new ArtifactWorkflowOutputPathError(
      `Refusing to use the source document path as build output: ${resolvedOutputDir}. Choose a dedicated child directory such as "${cliDefaults.outputDir}".`,
    )
  }

  if (resolvedOutputDir === inputParentDir) {
    throw new ArtifactWorkflowOutputPathError(
      `Refusing to use the source document directory as build output: ${resolvedOutputDir}. Choose a dedicated child directory such as "${cliDefaults.outputDir}".`,
    )
  }

  if (isParentDirectory(resolvedOutputDir, resolvedUserRoot)) {
    throw new ArtifactWorkflowOutputPathError(
      `Refusing to use a parent directory outside the project as build output: ${resolvedOutputDir}. Choose a child directory under ${resolvedUserRoot}.`,
    )
  }
}

function isParentDirectory(candidate, child) {
  const relative = path.relative(candidate, child)

  return (
    relative.length > 0 &&
    relative !== "." &&
    !relative.startsWith("..") &&
    !path.isAbsolute(relative)
  )
}
