import { createHash } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
import { createServer as createViteServer } from "vite"

import {
  hostRoot,
  packageRoot,
  requireFromPackage,
  resolvePackageModule,
  resolveWorkspaceTemplateRoot,
} from "./context.mjs"
import {
  createRuntimeDependencyContract,
  packageNameFromImport,
  RUNTIME_DEPENDENCY_CONTRACT_VERSION,
} from "./runtime-dependency-contract.mjs"
import { collectStaticBlockMetadata } from "../react-canvas/block-tags.mjs"
import { resolveBlockImplementationPath } from "../react-canvas/block-implementation.mjs"

export const hostEntryModulePath = "/__agent-html/host-entry.js"
export const artifactEntryModulePath = "/__agent-html/vite-artifact-entry.js"

export function toViteFsPath(filePath) {
  return `/@fs/${path.resolve(filePath).replaceAll(path.sep, "/")}`
}

export function createHostEntryModule({ pipeline = "codex" } = {}) {
  const hostEntryPath = toViteFsPath(path.join(hostRoot, "main.tsx"))
  return [
    `globalThis.__AGENT_HTML_HOST_CONFIG__ = ${JSON.stringify({
      contentSource: "artifacts",
      pipeline,
    })};`,
    `import ${JSON.stringify(hostEntryPath)};`,
    "",
  ].join("\n")
}

export async function createArtifactEntryModule({ filePath, root }) {
  const artifactPath = toViteFsPath(path.resolve(root, filePath))
  const artifactSource = await fs.readFile(path.resolve(root, filePath), "utf8")
  const blocks = collectStaticBlockMetadata(artifactSource)
  const componentEntries = await Promise.all(
    blocks.map(async (block, index) => {
      const implementationPath = await resolveBlockImplementationPath({
        blockId: block.id,
        filePath,
        root,
      })

      if (!implementationPath) {
        throw new Error(`Missing block implementation for ${block.id}`)
      }

      return {
        block,
        importName: `BlockComponent${index}`,
        modulePath: toViteFsPath(path.resolve(root, implementationPath)),
      }
    })
  )
  const componentImports = componentEntries
    .map(
      (entry) =>
        `import ${entry.importName} from ${JSON.stringify(entry.modulePath)}`
    )
    .join("\n")
  const componentMapEntries = componentEntries
    .map((entry) => `${JSON.stringify(entry.block.id)}: ${entry.importName}`)
    .join(",\n      ")

  return `
    import React from "react"
    import { createRoot } from "react-dom/client"
    import InitialComponent from ${JSON.stringify(artifactPath)}
    ${componentImports}

    const components = {
      ${componentMapEntries}
    }

    let Component = InitialComponent
    let mountedElement = null
    let mountedRoot = null

    export function mount(element) {
      mountedElement = element
      mountedRoot = createRoot(element, {
        onUncaughtError: showError,
        onRecoverableError: console.warn,
      })
      renderCurrent()

      return () => {
        mountedRoot?.unmount()
        mountedRoot = null
        mountedElement = null
      }
    }

    function renderCurrent() {
      if (!mountedRoot) {
        return
      }

      mountedRoot.render(React.createElement(Component, { components }))
      notifyArtifactRendered()
    }

    function notifyArtifactRendered() {
      requestAnimationFrame(() => {
        notify()
        setTimeout(notify, 50)
        setTimeout(notify, 250)
      })
    }

    function notify() {
      window.dispatchEvent(new CustomEvent("agent-html:artifact-rendered"))
    }

    function showError(error) {
      if (!mountedElement) {
        return
      }

      const message = error instanceof Error ? error.message : String(error)
      const stack = error instanceof Error && error.stack ? error.stack : ""
      mountedElement.innerHTML =
        '<div class="host-state"><strong>Artifact runtime error</strong><p>' +
        escapeHtml(message) +
        '</p>' +
        (stack ? '<pre>' + escapeHtml(stack) + '</pre>' : '') +
        '</div>'
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
    }

    if (import.meta.hot) {
      import.meta.hot.accept(${JSON.stringify(artifactPath)}, (module) => {
        Component = module.default
        renderCurrent()
      })
      import.meta.hot.dispose(() => {
        mountedRoot?.unmount()
        mountedRoot = null
        mountedElement = null
      })
    }
  `
}

export function cacheDirForRoot(
  root,
  runtimeFingerprint = process.env.AGENT_HTML_RUNTIME_FINGERPRINT || "source",
  contractDigest = readRuntimeDependencyContract().digest
) {
  const identity =
    runtimeFingerprint === "source"
      ? `${path.resolve(root)}\0${runtimeFingerprint}\0${contractDigest}`
      : `${path.resolve(packageRoot)}\0${runtimeFingerprint}\0${contractDigest}`
  const cacheKey = createHash("sha256").update(identity).digest("hex")
  const manifestPath = process.env.AGENT_HTML_RUNTIME_MANIFEST
  const selectedRuntimeRoot = manifestPath && path.dirname(manifestPath)
  const selectedRuntimesRoot = selectedRuntimeRoot && path.dirname(selectedRuntimeRoot)
  const selectedStoreRoot = selectedRuntimesRoot && path.dirname(selectedRuntimesRoot)
  const isSelectedRuntime =
    selectedRuntimesRoot && path.basename(selectedRuntimesRoot) === "runtimes"
  const cacheHome =
    process.env.AGENT_HTML_RUNTIME_CACHE_HOME ||
    (isSelectedRuntime ? path.join(selectedStoreRoot, "cache") : os.tmpdir())
  return path.join(cacheHome, "agent-html-vite-v6", cacheKey)
}

const optimizedDependencyCachePattern =
  /[\\/]agent-html-vite-v6[\\/].*[\\/]deps[\\/]/
const optimizedDependencyHeaderBytes = 256
const optimizedDependencyStartupTimeoutMs = 30_000
const optimizedDependencyLockStaleMs = 60_000
const optimizedDependencyLockPollMs = 50

function dependencyAllowRoots({ reactProtocolEntry, root }) {
  return [
    path.join(root, "node_modules"),
    path.join(packageRoot, ".."),
    path.dirname(reactProtocolEntry),
  ]
}

export function createViteFsAllowList({ reactProtocolEntry, root }) {
  return [
    path.join(root, "agent-html"),
    packageRoot,
    ...dependencyAllowRoots({ reactProtocolEntry, root }),
  ]
    .map((entry) => path.resolve(entry))
    .filter((entry, index, entries) => entries.indexOf(entry) === index)
}

export function createReactModuleResolutionAliases() {
  const reactEntry = resolvePackageModule("react")
  const reactDomEntry = resolvePackageModule("react-dom")
  const reactDomClientEntry = resolvePackageModule("react-dom/client")
  const reactJsxRuntimeEntry = resolvePackageModule("react/jsx-runtime")
  const reactJsxDevRuntimeEntry = resolvePackageModule("react/jsx-dev-runtime")

  return [
    { find: "react-dom/client", replacement: reactDomClientEntry },
    { find: /^react-dom$/, replacement: reactDomEntry },
    { find: "react/jsx-runtime", replacement: reactJsxRuntimeEntry },
    { find: "react/jsx-dev-runtime", replacement: reactJsxDevRuntimeEntry },
    { find: /^react$/, replacement: reactEntry },
  ]
}

export function resolvePackageImportModule(specifier) {
  try {
    return fileURLToPath(import.meta.resolve(specifier))
  } catch {
    try {
      return resolvePackageModule(specifier)
    } catch (error) {
      const assetPath = runtimePackageAsset(specifier)
      if (assetPath && existsSync(assetPath)) return assetPath
      throw error
    }
  }
}

function runtimePackageRoot(packageName) {
  const searchRoots = requireFromPackage.resolve.paths(packageName) ?? []
  return searchRoots
    .map((searchRoot) => path.join(searchRoot, packageName))
    .find((candidate) => existsSync(path.join(candidate, "package.json")))
}

function isPathInside(parent, candidate) {
  const relative = path.relative(parent, candidate.split("?", 1)[0])
  return (
    relative === "" ||
    (!relative.startsWith("..") && !path.isAbsolute(relative))
  )
}

const canonicalRendererPackages = new Set([
  "@agent-html/react",
  "react",
  "react-dom",
])

function readDependencyNames(packagePath) {
  if (!existsSync(packagePath)) {
    return []
  }

  const manifest = JSON.parse(readFileSync(packagePath, "utf8"))
  return Object.keys(manifest.dependencies ?? {})
}

export function readRuntimeDependencyContract(
  manifestPath = process.env.AGENT_HTML_RUNTIME_MANIFEST
) {
  if (manifestPath) {
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
    if (
      manifest.dependencyContractVersion !==
        RUNTIME_DEPENDENCY_CONTRACT_VERSION ||
      !Array.isArray(manifest.canvasDependencies) ||
      !Array.isArray(manifest.browserEntries) ||
      !Array.isArray(manifest.styleEntries) ||
      typeof manifest.dependencyContractDigest !== "string"
    ) {
      throw new Error("Desktop runtime dependency contract is incompatible")
    }
    return {
      canvasDependencies: manifest.canvasDependencies,
      browserEntries: manifest.browserEntries,
      digest: manifest.dependencyContractDigest,
      styleEntries: manifest.styleEntries,
      version: manifest.dependencyContractVersion,
    }
  }

  return createRuntimeDependencyContract(resolveWorkspaceTemplateRoot())
}

function runtimePackageAsset(specifier) {
  const packageName = packageNameFromImport(specifier)
  const packageRoot = packageName && runtimePackageRoot(packageName)
  if (!packageRoot) return null
  const subpath = specifier === packageName ? "" : specifier.slice(packageName.length + 1)
  const manifest = JSON.parse(
    readFileSync(path.join(packageRoot, "package.json"), "utf8")
  )
  const exported = manifest.exports?.[subpath ? `./${subpath}` : "."]
  const exportTarget =
    typeof exported === "string"
      ? exported
      : exported?.style || exported?.browser || exported?.default
  const candidates = [
    exportTarget && path.join(packageRoot, exportTarget),
    subpath && path.join(packageRoot, subpath),
    !subpath && manifest.style && path.join(packageRoot, manifest.style),
    !subpath && manifest.main && path.join(packageRoot, manifest.main),
  ].filter(Boolean)
  return candidates.find((candidate) => existsSync(candidate)) || null
}

export function createPlaygroundDependencyResolver(
  root,
  runtimeContract = readRuntimeDependencyContract()
) {
  const playgroundPackagePath = path.join(root, "agent-html", "package.json")
  if (!existsSync(playgroundPackagePath)) {
    return null
  }

  const workspaceDependencies = readDependencyNames(playgroundPackagePath)
  const dependencyNames = new Set(runtimeContract.canvasDependencies)
  const undeclaredRuntimeDependencies = workspaceDependencies.filter(
    (dependencyName) => !dependencyNames.has(dependencyName)
  )
  if (undeclaredRuntimeDependencies.length > 0) {
    throw new Error(
      `Canvas runtime does not provide declared dependencies: ${undeclaredRuntimeDependencies.join(", ")}`
    )
  }
  const missingDependencies = [...dependencyNames].filter(
    (dependencyName) => !runtimePackageRoot(dependencyName)
  )
  if (missingDependencies.length > 0) {
    throw new Error(
      `Canvas runtime does not provide declared dependencies: ${missingDependencies.join(", ")}`
    )
  }

  const canvasRoot = path.resolve(root, "agent-html")
  const allowedEntries = new Set([
    ...runtimeContract.browserEntries,
    ...runtimeContract.styleEntries,
  ])

  return {
    name: "agent-html-playground-dependencies",
    enforce: "pre",
    async resolveId(source, importer, options) {
      const packageName = packageNameFromImport(source)
      if (!packageName || !importer || !isPathInside(canvasRoot, importer)) {
        return null
      }

      if (!dependencyNames.has(packageName)) {
        throw new Error(
          `Canvas source imports undeclared dependency "${source}" from ${importer}`
        )
      }

      if (canonicalRendererPackages.has(packageName)) return null

      if (!allowedEntries.has(source)) {
        throw new Error(
          `Canvas dependency entry "${source}" is not supported by this runtime; rebuild or update the Desktop runtime`
        )
      }

      return null
    },
  }
}

export function createPlaygroundOptimizeDepsInclude(
  runtimeContract = readRuntimeDependencyContract()
) {
  return runtimeContract.browserEntries.filter(
    (specifier) => !canonicalRendererPackages.has(packageNameFromImport(specifier))
  )
}

export function createPlaygroundDependencyAliases(
  runtimeContract = readRuntimeDependencyContract()
) {
  return [...runtimeContract.browserEntries, ...runtimeContract.styleEntries]
    .filter(
      (specifier) => !canonicalRendererPackages.has(packageNameFromImport(specifier))
    )
    .map((specifier) => ({
      find: new RegExp(
        `^${specifier.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")}$`
      ),
      replacement: resolvePackageImportModule(specifier),
    }))
}

async function prebundlePlaygroundDependencies(vite) {
  const optimizer = vite.environments.client.depsOptimizer
  let timeout
  try {
    await Promise.race([
      (async () => {
        await optimizer.init()
        await optimizer.run()
        await Promise.all(
          Object.values(optimizer.metadata.discovered).map(
            (dependency) => dependency.processing
          )
        )
      })(),
      new Promise((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Canvas dependency prebundle timed out")),
          optimizedDependencyStartupTimeoutMs
        )
      }),
    ])
  } finally {
    clearTimeout(timeout)
  }
}

function optimizedDependencyReadyPath(cacheDir) {
  return path.join(cacheDir, ".agent-html-ready.json")
}

async function isOptimizedDependencyCacheReady(cacheDir, runtimeContract) {
  try {
    const marker = JSON.parse(
      await fs.readFile(optimizedDependencyReadyPath(cacheDir), "utf8")
    )
    return (
      marker.digest === runtimeContract.digest &&
      marker.version === RUNTIME_DEPENDENCY_CONTRACT_VERSION &&
      marker.browserEntryCount ===
        createPlaygroundOptimizeDepsInclude(runtimeContract).length &&
      (await findInvalidOptimizedDependencyCacheFiles(cacheDir)).length === 0
    )
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) return false
    throw error
  }
}

async function acquireOptimizedDependencyCache(cacheDir, runtimeContract) {
  if (await isOptimizedDependencyCacheReady(cacheDir, runtimeContract)) return null
  const lockPath = `${cacheDir}.lock`
  const deadline = Date.now() + optimizedDependencyStartupTimeoutMs
  await fs.mkdir(path.dirname(cacheDir), { recursive: true })

  while (Date.now() < deadline) {
    try {
      await fs.mkdir(lockPath)
      return async () => fs.rm(lockPath, { force: true, recursive: true })
    } catch (error) {
      if (error?.code !== "EEXIST") throw error
      if (await isOptimizedDependencyCacheReady(cacheDir, runtimeContract)) return null
      const stat = await fs.stat(lockPath).catch(() => null)
      if (stat && Date.now() - stat.mtimeMs > optimizedDependencyLockStaleMs) {
        await fs.rm(lockPath, { force: true, recursive: true })
        continue
      }
      await new Promise((resolve) => setTimeout(resolve, optimizedDependencyLockPollMs))
    }
  }

  throw new Error("Timed out waiting for Canvas dependency cache lock")
}

async function publishOptimizedDependencyCacheReady(cacheDir, runtimeContract) {
  const metadataPath = path.join(cacheDir, "deps", "_metadata.json")
  const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"))
  const optimized = new Set([
    ...Object.keys(metadata.optimized ?? {}),
    ...Object.keys(metadata.discovered ?? {}),
  ])
  const optimizedEntries = createPlaygroundOptimizeDepsInclude(runtimeContract)
  const missing = optimizedEntries.filter(
    (entry) => !optimized.has(entry)
  )
  if (missing.length > 0) {
    throw new Error(
      `Canvas dependency cache is incomplete: ${missing.join(", ")}`
    )
  }
  await fs.writeFile(
    optimizedDependencyReadyPath(cacheDir),
    `${JSON.stringify({
      browserEntryCount: optimizedEntries.length,
      digest: runtimeContract.digest,
      version: RUNTIME_DEPENDENCY_CONTRACT_VERSION,
    })}\n`
  )
}

export function isInvalidOptimizedDependencyCacheFile(buffer) {
  if (buffer.length === 0) {
    return true
  }

  if (buffer[0] === 0) {
    return true
  }

  const sampleLength = Math.min(buffer.length, optimizedDependencyHeaderBytes)
  let nullByteCount = 0

  for (let index = 0; index < sampleLength; index += 1) {
    if (buffer[index] === 0) {
      nullByteCount += 1
    }
  }

  return nullByteCount / sampleLength > 0.25
}

export async function findInvalidOptimizedDependencyCacheFiles(cacheDir) {
  const depsDir = path.join(cacheDir, "deps")
  let entries

  try {
    entries = await fs.readdir(depsDir, { withFileTypes: true })
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return []
    }

    throw error
  }

  const invalidFiles = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".js")) {
      continue
    }

    const filePath = path.join(depsDir, entry.name)
    const file = await fs.open(filePath, "r")
    try {
      const buffer = Buffer.alloc(optimizedDependencyHeaderBytes)
      const { bytesRead } = await file.read(buffer, 0, buffer.length, 0)
      const header = buffer.subarray(0, bytesRead)

      if (isInvalidOptimizedDependencyCacheFile(header)) {
        invalidFiles.push(filePath)
      }
    } finally {
      await file.close()
    }
  }

  return invalidFiles
}

export async function clearInvalidOptimizedDependencyCache({ cacheDir }) {
  const invalidFiles = await findInvalidOptimizedDependencyCacheFiles(cacheDir)

  if (invalidFiles.length === 0) {
    return {
      cleared: false,
      invalidFiles,
    }
  }

  await fs.rm(cacheDir, { force: true, recursive: true })
  return {
    cleared: true,
    invalidFiles,
  }
}

async function ensureValidOptimizedDependencyCache(cacheDir) {
  try {
    const result = await clearInvalidOptimizedDependencyCache({ cacheDir })

    if (result.cleared) {
      console.warn(
        "[agent-html] cleared corrupt Vite optimized dependency cache: %s",
        cacheDir
      )
    }
  } catch (error) {
    console.warn(
      "[agent-html] unable to inspect Vite optimized dependency cache: %s",
      error instanceof Error ? error.message : String(error)
    )
  }
}

function createAgentHtmlVitePlugin({ pipeline, root }) {
  return {
    name: "agent-html-dev-host",
    async resolveId(id, importer, options) {
      if (id.startsWith("@/")) {
        return this.resolve(path.join(root, "agent-html", id.slice(2)), importer, {
          ...options,
          skipSelf: true,
        })
      }
      if (
        id.startsWith("#agent-html-playground/") ||
        id.startsWith("@agent-html-playground/")
      ) {
        return this.resolve(
          path.join(root, "agent-html", id.split("/").slice(1).join("/")),
          importer,
          { ...options, skipSelf: true }
        )
      }
      if (
        id === hostEntryModulePath ||
        id.startsWith(`${artifactEntryModulePath}?`)
      ) {
        return id
      }

      return null
    },
    async load(id) {
      if (id === hostEntryModulePath) {
        return createHostEntryModule({ pipeline })
      }

      if (id.startsWith(`${artifactEntryModulePath}?`)) {
        const url = new URL(id, "http://agent-html.local")
        const filePath = url.searchParams.get("filePath")

        if (!filePath) {
          throw new Error("filePath is required")
        }

        return createArtifactEntryModule({ filePath, root })
      }

      return null
    },
  }
}

export async function createAgentHtmlViteServer({
  pipeline = "codex",
  root,
  server,
}) {
  const runtimeContract = readRuntimeDependencyContract()
  const cacheDir = cacheDirForRoot(
    root,
    process.env.AGENT_HTML_RUNTIME_FINGERPRINT || "source",
    runtimeContract.digest
  )
  await ensureValidOptimizedDependencyCache(cacheDir)
  const releaseDependencyCache = await acquireOptimizedDependencyCache(
    cacheDir,
    runtimeContract
  )
  const reactProtocolEntry = resolvePackageModule("@agent-html/react")
  const fsAllow = createViteFsAllowList({ reactProtocolEntry, root })
  const reactModuleResolutionAliases = createReactModuleResolutionAliases()
  const playgroundDependencyAliases = createPlaygroundDependencyAliases(
    runtimeContract
  )
  const playgroundDependencyResolver = createPlaygroundDependencyResolver(
    root,
    runtimeContract
  )

  const vite = await createViteServer({
    appType: "custom",
    cacheDir,
    configFile: false,
    logLevel: "error",
    optimizeDeps: {
      include: createPlaygroundOptimizeDepsInclude(runtimeContract),
    },
    publicDir: false,
    root: packageRoot,
    plugins: [
      createAgentHtmlVitePlugin({ pipeline, root }),
      ...(playgroundDependencyResolver ? [playgroundDependencyResolver] : []),
      react({
        exclude: [/node_modules/, optimizedDependencyCachePattern],
      }),
    ],
    resolve: {
      alias: [
        { find: "@agent-html/react", replacement: reactProtocolEntry },
        ...playgroundDependencyAliases,
        ...reactModuleResolutionAliases,
      ],
      dedupe: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    server: {
      fs: {
        allow: fsAllow,
      },
      hmr: {
        server,
      },
      middlewareMode: { server },
    },
  })

  try {
    await prebundlePlaygroundDependencies(vite)
    if (releaseDependencyCache) {
      await publishOptimizedDependencyCacheReady(cacheDir, runtimeContract)
    }
    return vite
  } catch (error) {
    await vite.close()
    throw error
  } finally {
    await releaseDependencyCache?.()
  }
}
