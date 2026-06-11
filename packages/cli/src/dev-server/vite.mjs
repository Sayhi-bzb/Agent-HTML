import { existsSync, readFileSync } from "node:fs"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
import { createServer as createViteServer } from "vite"

import { hostRoot, packageRoot, resolvePackageModule } from "./context.mjs"

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

export function createArtifactEntryModule({ filePath, root }) {
  const artifactPath = toViteFsPath(path.resolve(root, filePath))

  return `
    import React from "react"
    import { createRoot } from "react-dom/client"
    import InitialComponent from ${JSON.stringify(artifactPath)}

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

      mountedRoot.render(React.createElement(Component))
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

export function cacheDirForRoot(root) {
  const cacheKey = Buffer.from(path.resolve(root)).toString("base64url")
  return path.join(os.tmpdir(), "agent-html-vite", cacheKey)
}

const optimizedDependencyCachePattern = /[\\/]agent-html-vite[\\/].*[\\/]deps[\\/]/
const optimizedDependencyHeaderBytes = 256
export const playgroundOptimizeDeps = [
  "react",
  "react/jsx-dev-runtime",
  "react-dom/client",
  "class-variance-authority",
  "clsx",
  "@visx/event",
  "@visx/responsive",
  "@visx/sankey",
  "d3-sankey",
  "lucide-react",
  "motion/react",
  "shiki/bundle/web",
  "tailwind-merge",
]

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
  ].map((entry) => path.resolve(entry))
    .filter((entry, index, entries) => entries.indexOf(entry) === index)
}

export function createReactModuleResolutionAliases() {
  const reactEntry = resolvePackageModule("react")
  const reactDomClientEntry = resolvePackageModule("react-dom/client")
  const reactJsxRuntimeEntry = resolvePackageModule("react/jsx-runtime")
  const reactJsxDevRuntimeEntry = resolvePackageModule("react/jsx-dev-runtime")

  return [
    { find: "react-dom/client", replacement: reactDomClientEntry },
    { find: "react/jsx-runtime", replacement: reactJsxRuntimeEntry },
    { find: "react/jsx-dev-runtime", replacement: reactJsxDevRuntimeEntry },
    { find: /^react$/, replacement: reactEntry },
  ]
}

function exactPackageNamePattern(packageName) {
  return new RegExp(
    `^${packageName.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")}$`
  )
}

export function resolvePackageImportModule(specifier) {
  try {
    return fileURLToPath(import.meta.resolve(specifier))
  } catch {
    return resolvePackageModule(specifier)
  }
}

export function createPlaygroundDependencyAliases(root) {
  const playgroundPackagePath = path.join(root, "agent-html", "package.json")
  if (!existsSync(playgroundPackagePath)) {
    return []
  }

  const playgroundPackage = JSON.parse(
    readFileSync(playgroundPackagePath, "utf8")
  )
  const dependencyNames = Object.keys(playgroundPackage.dependencies ?? {})

  return dependencyNames.flatMap((dependencyName) => {
    try {
      return [
        {
          find: exactPackageNamePattern(dependencyName),
          replacement: resolvePackageImportModule(dependencyName),
        },
      ]
    } catch {
      return []
    }
  })
}

export function createPlaygroundOptimizeDepsInclude() {
  return [...playgroundOptimizeDeps]
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
    load(id) {
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

export async function createAgentHtmlViteServer({ pipeline = "codex", root, server }) {
  const cacheDir = cacheDirForRoot(root)
  await ensureValidOptimizedDependencyCache(cacheDir)
  const reactProtocolEntry = resolvePackageModule("@agent-html/react")
  const fsAllow = createViteFsAllowList({ reactProtocolEntry, root })
  const reactModuleResolutionAliases = createReactModuleResolutionAliases()
  const playgroundDependencyAliases = createPlaygroundDependencyAliases(root)

  return createViteServer({
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
}
