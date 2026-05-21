import {
  access,
  constants,
  mkdir,
  open,
  readFile,
  rm,
  stat,
  writeFile,
} from "node:fs/promises"
import path from "node:path"

import {
  createManagedRuntimeManifest,
  createRuntimeContractFromSchema,
  readManagedRuntimeCapability,
} from "../config/runtime-contract.mjs"
import {
  getRuntimePaths,
  runtimeManifestName,
  runtimePackageRoot,
  runtimeRenderer,
  runtimeVersion,
} from "./runtime-paths.mjs"
import {
  normalizeManagedRuntimeComponents,
  supportedRuntimeBase,
} from "../config/render-capabilities.mjs"
import { createPromptUiManifest, nativeRuntimeSetup } from "./runtime-setup.mjs"
import {
  assertRuntimeComponentsJson,
  assertRuntimeCssBase,
  assertRuntimeCssEntry,
  assertRuntimeCssImports,
  assertRuntimeShellViteConfig,
  assertRuntimeSurface,
} from "./runtime-surface.mjs"
import {
  assertArtifactProfileStorage,
  writeArtifactProfileStorage,
} from "./artifact-profile-storage.mjs"
import { writeRuntimeHost } from "./runtime-bootstrap/index.mjs"

export async function bootstrapManagedRuntime({
  packageVersion = "0.0.0",
  packageRoot = runtimePackageRoot,
  paths = getRuntimePaths(),
  setup = nativeRuntimeSetup,
  schema,
} = {}) {
  const normalizedSetup = {
    ...setup,
    components: normalizeManagedRuntimeComponents(setup?.components ?? []),
  }
  await mkdir(paths.runtimeDir, { recursive: true })
  await mkdir(paths.cacheDir, { recursive: true })
  await mkdir(paths.logsDir, { recursive: true })
  await mkdir(paths.configDir, { recursive: true })
  await writeArtifactProfileStorage(paths)
  const shadcnRuntimeSurface = await writeRuntimeHost({
    packageRoot,
    paths,
    schema,
    setup: normalizedSetup,
  })
  const promptUiManifest = createPromptUiManifest({
    packageVersion,
    setup: normalizedSetup,
    schema,
  })
  const runtimeContract = createRuntimeContractFromSchema(schema)
  const manifest = createManagedRuntimeManifest({
    componentSource: normalizedSetup.componentSource,
    components: normalizedSetup.components,
    installMode: normalizedSetup.installMode,
    packageVersion,
    paths,
    preset: normalizedSetup.preset,
    renderer: runtimeRenderer,
    runtimeBase: supportedRuntimeBase,
    runtimeContract,
    runtimeSurface: shadcnRuntimeSurface,
    uiLibrary: normalizedSetup.uiLibrary,
    version: runtimeVersion,
  })

  await writeJsonFile(paths.manifestPath, manifest)
  await writeJsonFile(paths.promptUiManifestPath, promptUiManifest)
  return {
    ...manifest,
    runtimeBase: manifest.runtimeBase ?? supportedRuntimeBase,
    installedUiComponents:
      manifest.installedUiComponents ?? manifest.components,
    renderableAgentComponents:
      manifest.renderableAgentComponents ?? manifest.components,
  }
}

export async function readRuntimeManifest(paths = getRuntimePaths()) {
  const source = await readFile(paths.manifestPath, "utf8")
  const manifest = JSON.parse(source)

  if (
    manifest?.kind !== "ahtml-managed-runtime" ||
    manifest?.renderer !== runtimeRenderer ||
    manifest?.version !== runtimeVersion
  ) {
    throw new Error(`${runtimeManifestName} was not written by ahtml.`)
  }

  const runtimeCapability = readManagedRuntimeCapability(manifest)

  return {
    ...manifest,
    runtimeCapability,
    runtimeBase: manifest.runtimeBase ?? supportedRuntimeBase,
    installedUiComponents:
      manifest.installedUiComponents ?? manifest.components,
    renderableAgentComponents:
      runtimeCapability.renderableAgentComponents ??
      manifest.renderableAgentComponents ??
      manifest.components,
  }
}

export async function readManagedRuntimeSnapshot(paths = getRuntimePaths()) {
  const checks = {
    root: await pathExists(paths.runtimeRoot),
    runtime: await pathExists(paths.runtimeDir),
    cache: await pathExists(paths.cacheDir),
    logs: await pathExists(paths.logsDir),
    config: await pathExists(paths.configDir),
    manifest: false,
    artifactProfileManifest: await pathExists(paths.artifactProfileManifestPath),
    artifactProfiles: await pathExists(paths.artifactProfilesDir),
    rendererAdapter: await pathExists(
      path.join(paths.runtimeSrcDir, "main.tsx"),
    ),
    shadcnComponents: false,
    runtimeShellViteConfig: false,
    componentsJson: false,
    shadcnCssEntry: false,
    shadcnCssImports: false,
    shadcnCssBase: false,
    shadcnSurface: false,
    promptUiManifest: await pathExists(paths.promptUiManifestPath),
    runtimeVerification: await pathExists(paths.runtimeVerificationPath),
    viteConfig: await pathExists(paths.runtimeViteConfigPath),
    outputWritable: false,
  }
  let manifest
  let manifestError = ""
  let runtimeDetail = ""

  try {
    manifest = await readRuntimeManifest(paths)
    checks.manifest = true
    checks.shadcnComponents = await runtimeComponentFilesExist({
      components: manifest.installedUiComponents ?? manifest.components ?? [],
      paths,
    })
  } catch (error) {
    manifestError = error instanceof Error ? error.message : String(error)
  }

  if (manifest) {
    checks.artifactProfiles = await evaluateStatusCheck(
      async () => assertArtifactProfileStorage(paths),
      (detail) => {
        runtimeDetail ||= detail
      },
    )
    checks.componentsJson = await evaluateStatusCheck(
      async () => assertRuntimeComponentsJson({ manifest, paths }),
      (detail) => {
        runtimeDetail ||= detail
      },
    )
    checks.shadcnCssEntry = await evaluateStatusCheck(
      async () => assertRuntimeCssEntry({ manifest, paths }),
      (detail) => {
        runtimeDetail ||= detail
      },
    )
    checks.shadcnCssImports = await evaluateStatusCheck(
      async () => assertRuntimeCssImports({ manifest, paths }),
      (detail) => {
        runtimeDetail ||= detail
      },
    )
    checks.shadcnCssBase = await evaluateStatusCheck(
      async () => assertRuntimeCssBase({ manifest, paths }),
      (detail) => {
        runtimeDetail ||= detail
      },
    )
    checks.runtimeShellViteConfig = await evaluateStatusCheck(
      async () => assertRuntimeShellViteConfig(paths),
      (detail) => {
        runtimeDetail ||= detail
      },
    )
    checks.shadcnSurface = await evaluateStatusCheck(
      async () => assertRuntimeSurface({ manifest, paths }),
      (detail) => {
        runtimeDetail ||= detail
      },
    )
  }

  return {
    checks,
    manifest,
    manifestError,
    paths,
    ready: false,
    runtimeDetail,
  }
}

export function assessManagedRuntimeSnapshot({
  outputDir,
  snapshot,
}) {
  const checks = {
    ...snapshot.checks,
  }
  const ready =
    checks.root &&
    checks.runtime &&
    checks.cache &&
    checks.logs &&
    checks.config &&
    checks.manifest &&
    checks.artifactProfileManifest &&
    checks.artifactProfiles &&
    checks.rendererAdapter &&
    checks.shadcnComponents &&
    checks.runtimeShellViteConfig &&
    checks.componentsJson &&
    checks.shadcnCssEntry &&
    checks.shadcnCssImports &&
    checks.shadcnCssBase &&
    checks.shadcnSurface &&
    checks.promptUiManifest &&
    checks.runtimeVerification &&
    checks.viteConfig &&
    (typeof outputDir === "undefined" || checks.outputWritable)

  return {
    ...snapshot,
    checks,
    outputDir,
    ready,
  }
}

export async function getRuntimeStatus({
  packageVersion = "0.0.0",
  outputDir,
  paths = getRuntimePaths(),
} = {}) {
  const snapshot = await readManagedRuntimeSnapshot(paths)

  if (outputDir) {
    snapshot.checks.outputWritable = await probeOutputPath(outputDir)
  }

  return {
    ...assessManagedRuntimeSnapshot({
      outputDir,
      snapshot,
    }),
    packageVersion,
  }
}

export async function writeGeneratedDocument(
  document,
  paths = getRuntimePaths(),
) {
  await mkdir(path.dirname(paths.generatedDocumentPath), { recursive: true })
  await writeJsonFile(paths.generatedDocumentPath, document)
}

export async function writeGeneratedRuntimeState(
  runtimeState,
  paths = getRuntimePaths(),
) {
  await mkdir(path.dirname(paths.generatedRuntimeStatePath), {
    recursive: true,
  })
  await writeJsonFile(paths.generatedRuntimeStatePath, runtimeState)
}

export async function withRuntimeBuildLock(
  paths = getRuntimePaths(),
  action,
) {
  const lockPath = path.join(paths.runtimeRoot, "runtime-build.lock")
  const staleAfterMs = 5 * 60 * 1000
  const retryDelayMs = 50
  const startedAt = Date.now()

  await mkdir(path.dirname(lockPath), { recursive: true })

  while (true) {
    let handle

    try {
      handle = await open(lockPath, "wx")
      await handle.writeFile(
        JSON.stringify(
          {
            pid: process.pid,
            startedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      )

      try {
        return await action()
      } finally {
        await handle.close()
        await writeFile(lockPath, "", { flag: "w" }).catch(() => {})
        await rm(lockPath, { force: true })
      }
    } catch (error) {
      if (handle) {
        await handle.close().catch(() => {})
      }

      if (error?.code !== "EEXIST") {
        throw error
      }

      const released = await tryReleaseStaleRuntimeBuildLock({
        lockPath,
        staleAfterMs,
      })

      if (!released && Date.now() - startedAt >= staleAfterMs) {
        throw new Error(
          `Timed out waiting for runtime build lock at ${lockPath}.`,
        )
      }

      await sleep(retryDelayMs)
    }
  }
}

export async function ensureRuntimeBuildLock(
  paths = getRuntimePaths(),
  action,
) {
  if (typeof action !== "function") {
    throw new TypeError("ensureRuntimeBuildLock requires an async action.")
  }

  return withRuntimeBuildLock(paths, action)
}

export async function bootstrapManagedRuntimeWithLock(
  options = {},
) {
  const {
    bootstrap = bootstrapManagedRuntime,
    paths = getRuntimePaths(),
  } = options
  return ensureRuntimeBuildLock(paths, async () =>
    bootstrap({
      ...options,
      paths,
    }),
  )
}

async function probeWritableDirectory(directory) {
  try {
    await mkdir(directory, { recursive: true })
    await access(directory, constants.W_OK)
    return true
  } catch {
    return false
  }
}

async function probeOutputPath(directory) {
  try {
    if (await pathExists(directory)) {
      return probeWritableDirectory(directory)
    }

    const parent = await findExistingAncestor(
      path.dirname(path.resolve(directory)),
    )
    await access(parent, constants.W_OK)
    return true
  } catch {
    return false
  }
}

async function findExistingAncestor(directory) {
  let current = path.resolve(directory)

  while (!(await pathExists(current))) {
    const parent = path.dirname(current)

    if (parent === current) {
      throw new Error(`No existing parent directory for ${directory}.`)
    }

    current = parent
  }

  return current
}

async function tryReleaseStaleRuntimeBuildLock({ lockPath, staleAfterMs }) {
  try {
    const lockStat = await stat(lockPath)

    if (Date.now() - lockStat.mtimeMs < staleAfterMs) {
      return false
    }

    await rm(lockPath, { force: true })
    return true
  } catch (error) {
    if (error?.code === "ENOENT") {
      return true
    }

    throw error
  }
}

function sleep(durationMs) {
  return new Promise((resolve) => setTimeout(resolve, durationMs))
}

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false
    }

    throw error
  }
}

async function runtimeComponentFilesExist({ components, paths }) {
  for (const component of components) {
    if (
      !(await pathExists(
        path.join(paths.runtimeComponentsDir, `${component}.tsx`),
      ))
    ) {
      return false
    }
  }

  return true
}

async function writeJsonFile(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

async function evaluateStatusCheck(check, onError) {
  try {
    await check()
    return true
  } catch (error) {
    onError?.(error instanceof Error ? error.message : String(error))
    return false
  }
}
