import path from "node:path"
import { buildRuntimeArtifact } from "./runtime-build.mjs"
import {
  withRuntimeBuildLock,
  writeGeneratedDocument,
  writeGeneratedRuntimeState,
} from "./runtime-status.mjs"
import { getRuntimeRenderDiagnostics } from "./runtime-renderability.mjs"
import { getCliSchemaOutput } from "./schema.mjs"
import {
  listStyleProfileReferences,
  readCurrentStyleProfileReference,
  resolveStyleProfileByReference,
} from "./style-profile-storage.mjs"
import { printDiagnostics, writeJsonFile } from "./cli-io.mjs"
import { createInspection } from "./artifact-workflow.mjs"
import { createGalleryPreviewDocument } from "./runtime-host/features/gallery/preview-document.mjs"

export class StyleGalleryProfileNotFoundError extends Error {
  constructor(artifactProfileReference, availableReferences) {
    super(
      [
        `Unknown artifact profile "${artifactProfileReference}".`,
        availableReferences.length > 0
          ? `Available profile-ref values: ${availableReferences.join(", ")}.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    )
    this.name = "StyleGalleryProfileNotFoundError"
    this.artifactProfileReference = artifactProfileReference
    this.styleReference = artifactProfileReference
    this.availableReferences = availableReferences
  }
}

export function createGalleryWorkflow({
  userRoot,
  defaultOutputDir,
  packageRoot,
  runtimePaths,
  readPackageVersion,
  ensureManagedRuntime,
}) {
  async function buildGalleryArtifact(outputPath, options = {}) {
    const outputDir = path.resolve(userRoot, outputPath ?? defaultOutputDir)
    const artifactProfileReference =
      options.artifactProfileReference ??
      options.styleReference ??
      (await readCurrentStyleProfileReference(runtimePaths))
    const artifactProfile = await resolveStyleProfileByReference(
      runtimePaths,
      artifactProfileReference,
    )

    if (!artifactProfile) {
      throw new StyleGalleryProfileNotFoundError(
        artifactProfileReference,
        await listStyleProfileReferences(runtimePaths),
      )
    }

    const schema = await getCliSchemaOutput()
    const packageVersion = await readPackageVersion()
    await ensureManagedRuntime(packageVersion, schema)

    const document = createStyleGalleryDocument(artifactProfile)
    const runtimeState = createGalleryRuntimeState({
      artifactProfile,
      artifactProfileReference,
      availableArtifactProfileReferences:
        await listStyleProfileReferences(runtimePaths),
    })
    const runtimeDiagnostics = await getRuntimeRenderDiagnostics({
      document,
      runtimePaths,
      schema,
    })

    if (runtimeDiagnostics.length > 0) {
      if (options.printDiagnostics !== false) {
        printDiagnostics(runtimeDiagnostics)
      }

      return createGalleryResult({
        diagnostics: runtimeDiagnostics,
        ok: false,
        outputDir,
        stage: "runtime-renderability",
        artifactProfileReference,
      })
    }

    await withRuntimeBuildLock(runtimePaths, async () => {
      await writeGeneratedDocument(document, runtimePaths)
      await writeGeneratedRuntimeState(runtimeState, runtimePaths)
      await buildRuntimeArtifact({
        outputDir,
        packageRoot,
        paths: runtimePaths,
      })
    })

    const inspection = createInspection(document)
    const inspectionPath = path.join(outputDir, "agent-html.inspect.json")
    await writeJsonFile(inspectionPath, inspection)

    return createGalleryResult({
      inspection,
      inspectionPath,
      ok: true,
      outputDir,
      runtimeState,
      artifactProfileReference,
    })
  }

  return {
    buildGalleryArtifact,
  }
}

export function createStyleGalleryDocument(styleProfile) {
  return createGalleryPreviewDocument(styleProfile)
}

export function createGalleryRuntimeState({
  availableArtifactProfileReferences,
  artifactProfile,
  artifactProfileReference,
}) {
  return {
    kind: "ahtml-runtime-state",
    version: 1,
    mode: "gallery",
    gallery: {
      availableArtifactProfileReferences,
      artifactProfileReference,
      artifactProfile,
      availableStyleReferences: availableArtifactProfileReferences,
      styleReference: artifactProfileReference,
    },
  }
}

function createGalleryResult({
  diagnostics = [],
  inspection,
  inspectionPath,
  ok,
  outputDir,
  stage,
  artifactProfileReference,
}) {
  return {
    kind: "agent-html-gallery-result",
    version: 1,
    ok,
    outputDir,
    artifactProfileReference,
    styleReference: artifactProfileReference,
    ...(inspection ? { inspection, inspectionPath } : {}),
    ...(diagnostics.length > 0 ? { diagnostics, stage } : {}),
  }
}

