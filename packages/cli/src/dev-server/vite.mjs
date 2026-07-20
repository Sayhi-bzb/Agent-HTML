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
  RUNTIME_DEPENDENCY_CONTRACT_VERSION,
  playgroundCommonJsInteropDeps,
  playgroundOptimizeDeps,
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
  runtimeFingerprint = process.env.AGENT_HTML_RUNTIME_FINGERPRINT || "source"
) {
  const cacheKey = Buffer.from(
    `${path.resolve(root)}\0${runtimeFingerprint}`
  ).toString("base64url")
  return path.join(os.tmpdir(), "agent-html-vite-v5", cacheKey)
}

const optimizedDependencyCachePattern =
  /[\\/]agent-html-vite-v5[\\/].*[\\/]deps[\\/]/
const optimizedDependencyHeaderBytes = 256
const optimizedDependencyStartupTimeoutMs = 30_000
export { playgroundCommonJsInteropDeps, playgroundOptimizeDeps }

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
    return resolvePackageModule(specifier)
  }
}

function packageNameFromImport(specifier) {
  const request = specifier.split(/[?#]/, 1)[0]
  if (
    !request ||
    request.startsWith(".") ||
    request.startsWith("/") ||
    request.startsWith("\\") ||
    request.startsWith("#") ||
    request.includes("\0") ||
    /^[a-z][a-z\d+.-]*:/i.test(request)
  ) {
    return null
  }

  const segments = request.split("/")
  const packageName = request.startsWith("@")
    ? segments.slice(0, 2).join("/")
    : segments[0]

  return /^(@[a-z\d._-]+\/[a-z\d._-]+|[a-z\d._-]+)$/i.test(packageName)
    ? packageName
    : null
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
      !Array.isArray(manifest.optimizeDeps)
    ) {
      throw new Error("Desktop runtime dependency contract is incompatible")
    }
    return {
      canvasDependencies: manifest.canvasDependencies,
      optimizeDeps: manifest.optimizeDeps,
    }
  }

  return {
    canvasDependencies: readDependencyNames(
      path.join(resolveWorkspaceTemplateRoot(), "package.json")
    ),
    optimizeDeps: playgroundOptimizeDeps,
  }
}

export function createPlaygroundDependencyResolver(
  root,
  runtimeContract = readRuntimeDependencyContract()
) {
  const playgroundPackagePath = path.join(root, "agent-html", "package.json")
  if (!existsSync(playgroundPackagePath)) {
    return null
  }

  const dependencyNames = new Set(
    [
      ...readDependencyNames(playgroundPackagePath),
      ...runtimeContract.canvasDependencies,
      ...playgroundCommonJsInteropDeps.map(packageNameFromImport),
    ]
  )
  const missingDependencies = [...dependencyNames].filter(
    (dependencyName) => !runtimePackageRoot(dependencyName)
  )
  if (missingDependencies.length > 0) {
    throw new Error(
      `Canvas runtime does not provide declared dependencies: ${missingDependencies.join(", ")}`
    )
  }

  const canvasRoot = path.resolve(root, "agent-html")
  const runtimeImporter = path.join(packageRoot, "package.json")

  return {
    name: "agent-html-playground-dependencies",
    enforce: "pre",
    async resolveId(source, importer, options) {
      const packageName = packageNameFromImport(source)
      if (!packageName || canonicalRendererPackages.has(packageName)) {
        return null
      }

      if (!dependencyNames.has(packageName)) {
        if (importer && isPathInside(canvasRoot, importer)) {
          throw new Error(
            `Canvas source imports undeclared dependency "${source}" from ${importer}`
          )
        }
        return null
      }

      const resolved = await this.resolve(source, runtimeImporter, {
        ...options,
        skipSelf: true,
      })
      if (!resolved) {
        throw new Error(
          `Canvas dependency "${source}" is declared but unavailable in the bundled runtime`
        )
      }
      return resolved
    },
  }
}

export function createPlaygroundOptimizeDepsInclude(
  runtimeContract = readRuntimeDependencyContract()
) {
  return [...runtimeContract.optimizeDeps]
}

export function createPlaygroundOptimizeDepsAliases(
  runtimeContract = readRuntimeDependencyContract()
) {
  return runtimeContract.optimizeDeps
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
    resolveId(id) {
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
  const cacheDir = cacheDirForRoot(root)
  await ensureValidOptimizedDependencyCache(cacheDir)
  const reactProtocolEntry = resolvePackageModule("@agent-html/react")
  const fsAllow = createViteFsAllowList({ reactProtocolEntry, root })
  const reactModuleResolutionAliases = createReactModuleResolutionAliases()
  const playgroundOptimizeDepsAliases = createPlaygroundOptimizeDepsAliases()
  const playgroundDependencyResolver = createPlaygroundDependencyResolver(root)

  const vite = await createViteServer({
    appType: "custom",
    cacheDir,
    configFile: false,
    logLevel: "error",
    optimizeDeps: {
      include: createPlaygroundOptimizeDepsInclude(),
    },
    publicDir: false,
    root,
    plugins: [
      createAgentHtmlVitePlugin({ pipeline, root }),
      ...(playgroundDependencyResolver ? [playgroundDependencyResolver] : []),
      react({
        exclude: [/node_modules/, optimizedDependencyCachePattern],
      }),
    ],
    resolve: {
      alias: [
        { find: "@", replacement: path.join(root, "agent-html") },
        {
          find: "#agent-html-playground",
          replacement: path.join(root, "agent-html"),
        },
        { find: "@agent-html/react", replacement: reactProtocolEntry },
        ...playgroundOptimizeDepsAliases,
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
    return vite
  } catch (error) {
    await vite.close()
    throw error
  }
}
