import http from "node:http"
import { watch } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { pathToFileURL } from "node:url"

import {
  BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE,
  DEFAULT_ARTIFACT_PROFILE_REFERENCE,
} from "@agent-html/core"

import { printDiagnostics } from "./cli-io.mjs"
import {
  readCurrentArtifactProfileReference,
  resolveArtifactProfileByReference,
} from "./artifact-profile-storage.mjs"
import { resolveRuntimeDependencies } from "./runtime-bootstrap/index.mjs"
import {
  withRuntimeBuildLock,
  writeGeneratedDocument,
  writeGeneratedRuntimeState,
} from "./runtime-status.mjs"

const previewRefreshDebounceMs = 75

export async function runRuntimePreviewSession({
  absoluteInputPath,
  inputPath,
  packageRoot,
  paths,
  port,
  prepareDocumentRuntime,
}) {
  let lastStableDocument = await createFallbackPreviewDocument(paths)

  await withRuntimeBuildLock(paths, async () => {
    await writeGeneratedDocument(lastStableDocument, paths)
    await writeGeneratedRuntimeState(
      createPreviewDiagnosticsRuntimeState({
        artifactProfile: lastStableDocument.meta.artifactProfile,
        diagnostics: [
          {
            severity: "info",
            code: "preview-starting",
            path: inputPath,
            message: "Preview is starting.",
          },
        ],
        inputPath,
      }),
      paths,
    )
  })

  await refreshPreviewState({
    absoluteInputPath,
    inputPath,
    lastStableDocumentRef: {
      get current() {
        return lastStableDocument
      },
      set current(value) {
        lastStableDocument = value
      },
    },
    paths,
    prepareDocumentRuntime,
  })

  const previewServer = await createRuntimePreviewServer({
    packageRoot,
    paths,
    port,
  })
  const watcher = createPreviewWatcher({
    absoluteInputPath,
    onChange: () =>
      refreshPreviewState({
        absoluteInputPath,
        inputPath,
        lastStableDocumentRef: {
          get current() {
            return lastStableDocument
          },
          set current(value) {
            lastStableDocument = value
          },
        },
        paths,
        prepareDocumentRuntime,
      }),
  })

  try {
    await waitForShutdown()
  } finally {
    watcher.close()
    await previewServer.close()
  }
}

async function refreshPreviewState({
  absoluteInputPath,
  inputPath,
  lastStableDocumentRef,
  paths,
  prepareDocumentRuntime,
}) {
  const prepared = await prepareDocumentRuntime(absoluteInputPath, {
    printDiagnostics: false,
  })

  if (prepared.ok) {
    if (prepared.diagnostics?.length > 0) {
      printDiagnostics(prepared.diagnostics)
    }

    lastStableDocumentRef.current = prepared.document
    await withRuntimeBuildLock(paths, async () => {
      await writeGeneratedDocument(prepared.document, paths)
      await writeGeneratedRuntimeState(
        {
          kind: "ahtml-runtime-state",
          version: 1,
          mode: "document",
          artifactProfileReference: prepared.document.meta.artifactProfileReference,
          artifactProfile: prepared.document.meta.artifactProfile,
          document: prepared.document,
          diagnostics: prepared.diagnostics,
          inputPath,
        },
        paths,
      )
    })
    return
  }

  if (prepared.diagnostics?.length > 0) {
    printDiagnostics(prepared.diagnostics)
  }

  await withRuntimeBuildLock(paths, async () => {
    await writeGeneratedDocument(lastStableDocumentRef.current, paths)
    await writeGeneratedRuntimeState(
      createPreviewDiagnosticsRuntimeState({
        artifactProfile: lastStableDocumentRef.current.meta.artifactProfile,
        diagnostics: prepared.diagnostics ?? [],
        inputPath,
      }),
      paths,
    )
  })
}

async function createRuntimePreviewServer({ packageRoot, paths, port }) {
  const vite = await import(
    pathToFileURL(resolveRuntimeDependencies(packageRoot).viteModule).href
  )
  const templatePath = path.join(paths.runtimeDir, "index.html")
  const runtimeTemplateViteConfigPath = path.join(paths.runtimeDir, "vite.config.ts")
  const httpServer = http.createServer()
  const viteServer = await vite.createServer({
    appType: "custom",
    clearScreen: false,
    configFile: runtimeTemplateViteConfigPath,
    root: paths.runtimeDir,
    server: {
      host: "127.0.0.1",
      hmr: {
        host: "127.0.0.1",
        server: httpServer,
      },
      middlewareMode: true,
      port,
      strictPort: false,
    },
  })

  httpServer.on("request", async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1")

    if (
      request.method === "GET" &&
      (requestUrl.pathname === "/" || requestUrl.pathname === "/index.html")
    ) {
      try {
        const template = await viteServer.transformIndexHtml(
          requestUrl.pathname,
          await readFile(templatePath, "utf8"),
        )
        const { renderRuntimeAppToHtml } = await viteServer.ssrLoadModule(
          "/src/render-ssr.tsx",
        )
        const html = template.replace(
          '<div id="root"></div>',
          `<div id="root">${await renderRuntimeAppToHtml()}</div>`,
        )

        response.writeHead(200, {
          "content-type": "text/html; charset=utf-8",
        })
        response.end(html)
      } catch (error) {
        viteServer.ssrFixStacktrace(error)
        response.writeHead(500, {
          "content-type": "text/plain; charset=utf-8",
        })
        response.end(
          error instanceof Error ? error.stack ?? error.message : String(error),
        )
      }
      return
    }

    try {
      await new Promise((resolve, reject) => {
        viteServer.middlewares(request, response, (error) => {
          if (error) {
            reject(error)
            return
          }

          resolve(undefined)
        })
      })

      if (!response.writableEnded) {
        response.writeHead(404)
        response.end("Not found")
      }
    } catch (error) {
      response.writeHead(500, {
        "content-type": "text/plain; charset=utf-8",
      })
      response.end(error instanceof Error ? error.message : String(error))
    }
  })

  await new Promise((resolve, reject) => {
    httpServer.once("error", reject)
    httpServer.listen(port, "127.0.0.1", resolve)
  })

  const address = httpServer.address()
  const actualPort =
    typeof address === "object" && address ? address.port : port
  process.stdout.write(`Preview: http://127.0.0.1:${actualPort}\n`)

  return {
    close: async () => {
      await viteServer.close()
      await new Promise((resolve) => httpServer.close(resolve))
    },
  }
}

function createPreviewWatcher({ absoluteInputPath, onChange }) {
  const watchedDirectory = path.dirname(absoluteInputPath)
  const watchedFileName = path.basename(absoluteInputPath)
  let refreshTimeout
  let refreshPromise = Promise.resolve()
  const watcher = watch(watchedDirectory, { persistent: false }, (event, file) => {
    const fileName = typeof file === "string" ? file : file?.toString()

    if (
      (event === "change" || event === "rename") &&
      fileName === watchedFileName
    ) {
      clearTimeout(refreshTimeout)
      refreshTimeout = setTimeout(() => {
        refreshPromise = refreshPromise
          .catch(() => {})
          .then(() => onChange())
          .catch(() => {})
      }, previewRefreshDebounceMs)
    }
  })

  return {
    close: () => {
      clearTimeout(refreshTimeout)
      watcher.close()
    },
  }
}

async function createFallbackPreviewDocument(paths) {
  const artifactProfileReference =
    await readCurrentArtifactProfileReference(paths).catch(
      () => DEFAULT_ARTIFACT_PROFILE_REFERENCE,
    )
  const artifactProfile =
    (await resolveArtifactProfileByReference(paths, artifactProfileReference)) ??
    BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[DEFAULT_ARTIFACT_PROFILE_REFERENCE]

  return {
    meta: {
      artifactProfileReference: artifactProfile.id,
      artifactProfile,
    },
    components: [
      {
        type: "component",
        name: "page",
        props: {
          title: "Preview",
        },
        children: [
          {
            type: "component",
            name: "card",
            props: {
              title: "Preview Session",
            },
            children: [
              {
                type: "text",
                value: "Waiting for a valid document.",
              },
            ],
          },
        ],
      },
    ],
  }
}

function createPreviewDiagnosticsRuntimeState({
  artifactProfile,
  diagnostics,
  inputPath,
}) {
  return {
    kind: "ahtml-runtime-state",
    version: 1,
    mode: "diagnostics",
    artifactProfileReference: artifactProfile.id,
    artifactProfile,
    diagnostics,
    inputPath,
  }
}

function waitForShutdown() {
  return new Promise((resolve) => {
    let settled = false
    const finish = () => {
      if (settled) {
        return
      }

      settled = true
      process.off("SIGINT", finish)
      process.off("SIGTERM", finish)
      resolve()
    }

    process.once("SIGINT", finish)
    process.once("SIGTERM", finish)
  })
}
