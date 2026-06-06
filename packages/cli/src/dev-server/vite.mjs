import os from "node:os"
import path from "node:path"

import react from "@vitejs/plugin-react"
import { createServer as createViteServer } from "vite"

import { hostRoot, packageRoot, resolvePackageModule } from "./context.mjs"

export const hostEntryModulePath = "/__agent-html/host-entry.js"
export const artifactEntryModulePath = "/__agent-html/vite-artifact-entry.js"

export function toViteFsPath(filePath) {
  return `/@fs/${path.resolve(filePath).replaceAll(path.sep, "/")}`
}

export function createHostEntryModule() {
  const hostEntryPath = toViteFsPath(path.join(hostRoot, "main.tsx"))
  return `import ${JSON.stringify(hostEntryPath)};\n`
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

function cacheDirForRoot(root) {
  const cacheKey = Buffer.from(path.resolve(root)).toString("base64url")
  return path.join(os.tmpdir(), "agent-html-vite", cacheKey)
}

function createAgentHtmlVitePlugin({ root }) {
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
        return createHostEntryModule()
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

export async function createAgentHtmlViteServer({ root, server }) {
  const reactProtocolEntry = resolvePackageModule("@agent-html/react")

  return createViteServer({
    appType: "custom",
    cacheDir: cacheDirForRoot(root),
    configFile: false,
    logLevel: "error",
    publicDir: false,
    root,
    plugins: [createAgentHtmlVitePlugin({ root }), react()],
    resolve: {
      alias: {
        "@": path.join(root, "agent-html"),
        "#agent-html-playground": path.join(root, "agent-html"),
        "@agent-html/react": reactProtocolEntry,
      },
    },
    server: {
      fs: {
        allow: [
          path.join(root, "agent-html"),
          packageRoot,
          path.dirname(reactProtocolEntry),
        ],
      },
      hmr: {
        server,
      },
      middlewareMode: { server },
    },
  })
}
