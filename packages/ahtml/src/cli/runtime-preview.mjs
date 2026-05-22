import http from "node:http"
import { watch } from "node:fs"
import { readFile, readdir } from "node:fs/promises"
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
import { getCliSchemaOutput } from "./schema.mjs"
import { resolveRuntimeDependencies } from "./runtime-bootstrap/index.mjs"
import {
  bootstrapManagedRuntime,
  getRuntimeStatus,
  readRuntimeManifest,
  withRuntimeBuildLock,
  writeGeneratedDocument,
  writeGeneratedRuntimeState,
} from "./runtime-status.mjs"
import {
  nativeRuntimeSetup,
  resolveRuntimeSetup,
} from "./runtime-setup.mjs"
import { assertRuntimeSurface } from "./runtime-surface.mjs"
import { assertRuntimeHostSourceParity } from "./runtime-host-proof.mjs"
import {
  assertRendererSpecParity,
  assertVerificationDataParity,
  readRuntimeVerificationState,
} from "./runtime-renderability.mjs"

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
    packageRoot,
    prepareDocumentRuntime,
  })

  const previewServer = await createRuntimePreviewServer({
    packageRoot,
    paths,
    port,
  })
  const watcher = await createPreviewWatcher({
    absoluteInputPath,
    packageRoot,
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
        packageRoot,
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
  packageRoot,
  prepareDocumentRuntime,
}) {
  await ensurePreviewRuntimeCurrent({ packageRoot, paths })

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
        await ensurePreviewRuntimeCurrent({ packageRoot, paths })
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

async function ensurePreviewRuntimeCurrent({ packageRoot, paths }) {
  const schema = await getCliSchemaOutput()
  const status = await getRuntimeStatus({ paths })

  if (status.ready && (await isPreviewRuntimeCurrent({ paths, schema }))) {
    return
  }

  await withRuntimeBuildLock(paths, async () => {
    const refreshedStatus = await getRuntimeStatus({ paths })

    if (
      refreshedStatus.ready &&
      (await isPreviewRuntimeCurrent({ paths, schema }))
    ) {
      return
    }

    await bootstrapManagedRuntime({
      packageRoot,
      paths,
      schema,
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
    })
  })
}

async function isPreviewRuntimeCurrent({ paths, schema }) {
  try {
    const runtimeVerificationState =
      await readRuntimeVerificationState(paths)
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
    const runtimeManifest = await readRuntimeManifest(paths)
    await assertRuntimeSurface({
      manifest: runtimeManifest,
      paths,
    })
    await assertRuntimeHostSourceParity({
      paths,
      proof: runtimeManifest.shadcnRuntimeSurface?.ahtmlHostProof,
    })
    return true
  } catch {
    return false
  }
}

async function createPreviewWatcher({
  absoluteInputPath,
  packageRoot,
  onChange,
}) {
  const watchedDirectory = path.dirname(absoluteInputPath)
  const watchedFileName = path.basename(absoluteInputPath)
  const repoWatchRoots = [
    path.join(packageRoot, "src"),
    path.resolve(packageRoot, "..", "core", "src"),
  ]
  const repoWatchDirectories = await collectWatchDirectories(repoWatchRoots)
  const watchers = []
  let refreshTimeout
  let refreshPromise = Promise.resolve()

  const scheduleRefresh = () => {
    clearTimeout(refreshTimeout)
    refreshTimeout = setTimeout(() => {
      refreshPromise = refreshPromise
        .catch(() => {})
        .then(() => onChange())
        .catch(() => {})
    }, previewRefreshDebounceMs)
  }

  watchers.push(
    watch(watchedDirectory, { persistent: false }, (event, file) => {
      const fileName = typeof file === "string" ? file : file?.toString()

      if (
        (event === "change" || event === "rename") &&
        fileName === watchedFileName
      ) {
        scheduleRefresh()
      }
    }),
  )

  for (const directory of repoWatchDirectories) {
    watchers.push(
      watch(directory, { persistent: false }, (event, file) => {
        const fileName = typeof file === "string" ? file : file?.toString()

        if (
          event === "change" ||
          event === "rename" ||
          typeof fileName === "string"
        ) {
          scheduleRefresh()
        }
      }),
    )
  }

  return {
    close: () => {
      clearTimeout(refreshTimeout)
      for (const currentWatcher of watchers) {
        currentWatcher.close()
      }
    },
  }
}

async function collectWatchDirectories(roots) {
  const directories = []

  for (const root of roots) {
    directories.push(...(await walkDirectories(root)))
  }

  return directories
}

async function walkDirectories(root) {
  try {
    const entries = await readdir(root, { withFileTypes: true })
    const directories = [root]

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      directories.push(
        ...(await walkDirectories(path.join(root, entry.name))),
      )
    }

    return directories
  } catch (error) {
    if (error?.code === "ENOENT") {
      return []
    }

    throw error
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
