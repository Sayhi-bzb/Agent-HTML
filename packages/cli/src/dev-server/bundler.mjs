import path from "node:path"

import * as esbuild from "esbuild"

import { hostRoot, repoRoot, requireFromRepo } from "./context.mjs"
import { assertInsideWorkspace, resolveAgentHtmlModule } from "./workspace.mjs"
import { workspaceRelativePath } from "../react-canvas/paths.mjs"

const reactPackagePath = path.join(repoRoot, "packages", "react", "src", "index.tsx")

function createSingletonPackageMap() {
  return new Map([
    ["react", requireFromRepo.resolve("react")],
    ["react-dom", requireFromRepo.resolve("react-dom")],
    ["react-dom/client", requireFromRepo.resolve("react-dom/client")],
    ["react/jsx-dev-runtime", requireFromRepo.resolve("react/jsx-dev-runtime")],
    ["react/jsx-runtime", requireFromRepo.resolve("react/jsx-runtime")],
  ])
}

function createCommonResolvePlugin({ root, includeReactPackage }) {
  const singletonPackages = createSingletonPackageMap()

  return {
    name: "agent-html-resolve",
    setup(build) {
      build.onResolve(
        {
          filter:
            /^react$|^react-dom$|^react-dom\/client$|^react\/jsx-dev-runtime$|^react\/jsx-runtime$/,
        },
        (args) => ({
          path: singletonPackages.get(args.path),
        })
      )
      if (includeReactPackage) {
        build.onResolve({ filter: /^@agent-html\/react$/ }, () => ({
          path: reactPackagePath,
        }))
      }
      build.onResolve({ filter: /^#agent-html-playground\/|^@\// }, (args) => {
        try {
          return { path: resolveAgentHtmlModule(root, args.path) }
        } catch (error) {
          return {
            errors: [
              {
                text: error instanceof Error ? error.message : String(error),
              },
            ],
          }
        }
      })
    },
  }
}

const commonBuildOptions = {
  bundle: true,
  format: "esm",
  jsx: "automatic",
  loader: {
    ".avif": "dataurl",
    ".csv": "text",
    ".gif": "dataurl",
    ".jpeg": "dataurl",
    ".jpg": "dataurl",
    ".json": "json",
    ".png": "dataurl",
    ".svg": "dataurl",
    ".ts": "ts",
    ".tsx": "tsx",
    ".webp": "dataurl",
  },
  logLevel: "silent",
  mainFields: ["browser", "module", "main"],
  platform: "browser",
  write: false,
}

export async function buildArtifactBundle({ filePath, root }) {
  const absolutePath = assertInsideWorkspace(root, filePath)
  const artifactImport = `./${workspaceRelativePath(root, absolutePath).replaceAll("\\", "/")}`
  const result = await esbuild.build({
    ...commonBuildOptions,
    absWorkingDir: root,
    plugins: [createCommonResolvePlugin({ root, includeReactPackage: true })],
    stdin: {
      contents: `
        import React from "react"
        import { createRoot } from "react-dom/client"
        import Component from ${JSON.stringify(artifactImport)}

        export function mount(element) {
          const showError = (error) => {
            const message = error instanceof Error ? error.message : String(error)
            const stack = error instanceof Error && error.stack ? error.stack : ""
            element.innerHTML =
              '<div class="host-state"><strong>Artifact runtime error</strong><p>' +
              escapeHtml(message) +
              '</p>' +
              (stack ? '<pre>' + escapeHtml(stack) + '</pre>' : '') +
              '</div>'
          }
          const root = createRoot(element, {
            onUncaughtError: showError,
            onRecoverableError: console.warn,
          })
          root.render(React.createElement(Component))
          const notify = () => {
            window.dispatchEvent(new CustomEvent("agent-html:artifact-rendered"))
          }
          requestAnimationFrame(() => {
            notify()
            setTimeout(notify, 50)
            setTimeout(notify, 250)
          })
          return () => root.unmount()
        }

        function escapeHtml(value) {
          return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
        }
      `,
      loader: "tsx",
      resolveDir: root,
      sourcefile: "agent-html-artifact-entry.tsx",
    },
  })

  return result.outputFiles[0]?.text ?? ""
}

export async function buildHostBundle({ root }) {
  const result = await esbuild.build({
    ...commonBuildOptions,
    absWorkingDir: repoRoot,
    entryPoints: [path.join(hostRoot, "main.tsx")],
    plugins: [createCommonResolvePlugin({ root, includeReactPackage: false })],
  })

  return result.outputFiles[0]?.text ?? ""
}
