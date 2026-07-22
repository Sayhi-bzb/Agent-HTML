import fs from "node:fs/promises"
import path from "node:path"

import {
  inspectCanvasNode,
  inspectCanvasOverview,
  inspectCanvasViewport,
  resolveCanvasLayerOrder,
  resolveCanvasReparenting,
  resolveCanvasNodeSource,
} from "@agent-html/kernel"
import {
  extractStaticCanvasIntent,
  reorderStaticCanvasNodes,
  reparentStaticCanvasNodes,
  replaceArtifactTitle,
} from "@agent-html/kernel/validate"
import { workspaceRelativePath } from "../react-canvas/paths.mjs"
import { createArtifactScaffold } from "../react-canvas/artifact-scaffold.mjs"
import { resolveBlockImplementationPath } from "../react-canvas/block-implementation.mjs"
import { readTextFile } from "../react-canvas/workspace-file.mjs"
import {
  canvasLayoutPathForEntry,
  legacyCanvasLayoutPathForEntry,
} from "./canvas-registry.mjs"
import { readColdCanvasInspectionDocument } from "./canvas-cold-inspection.mjs"
import {
  patchStoredCanvasLayout,
  readStoredCanvasLayout,
  writeStoredCanvasLayout,
} from "./canvas-layout-storage.mjs"
import {
  listCodexThreads,
  readCodexThreadTranscript,
  startCodexTurn,
} from "./codex-bridge.mjs"
import { hostRoot } from "./context.mjs"
import { sendError, sendJson, sendNotFound, sendText } from "./http.mjs"
import { loadHostStyles } from "./styles.mjs"
import {
  requireRuntimeShutdown,
  runtimeProtocolVersion,
} from "./runtime-session.mjs"
import { assertInsideAgentHtmlWorkspace } from "./workspace.mjs"
import {
  artifactEntryModulePath,
  canvasEntryModulePath,
  hostEntryModulePath,
} from "./vite.mjs"

export const hostRoutes = {
  artifactBundle: "/__agent-html/artifact.js",
  artifactCreate: "/__agent-html/artifact/create",
  artifactDelete: "/__agent-html/artifact/delete",
  artifactRename: "/__agent-html/artifact/rename",
  artifactTitle: "/__agent-html/artifact/title",
  artifacts: "/__agent-html/artifacts",
  artifactPublicAsset: "/__agent-html/artifacts/",
  canvasBundle: "/__agent-html/canvas.js",
  canvasInspection: "/__agent-html/canvas/inspection",
  canvasLayout: "/__agent-html/canvas/layout",
  canvasReorder: "/__agent-html/canvas/reorder",
  canvasReparent: "/__agent-html/canvas/reparent",
  canvases: "/__agent-html/canvases",
  blockImplementation: "/__agent-html/block-implementation",
  codexThreads: "/__agent-html/codex/threads",
  codexTranscript: "/__agent-html/codex/transcript",
  codexTurn: "/__agent-html/codex/turn",
  fontAsset: "/__agent-html/font-asset",
  fontStylesheet: "/__agent-html/font-stylesheet",
  hostEntry: "/__agent-html/host-entry.js",
  publicAsset: "/__agent-html/public/",
  hostStyles: "/__agent-html/styles.css",
  runtimeHealth: "/__agent-html/runtime/health",
  runtimeShutdown: "/__agent-html/runtime/shutdown",
}

export const devServerRoutePipelines = [
  "host-shell",
  "runtime-module",
  "styles-and-assets",
  "public-asset",
  "artifact-registry-and-validation-report",
  "artifact-source-mutation",
  "canvas-registry-and-layout",
  "canvas-inspection",
  "block-lookup",
  "codex-bridge",
  "runtime-control",
]

const forbiddenRootAssetPattern = /^\/[^/]+\.(?:css|js)$/

function resolveCanvasEntryPath({ filePath, root }) {
  const canvasesRoot = path.resolve(root, "agent-html", "canvases")
  const entryPath = path.resolve(root, filePath)
  const relativePath = path.relative(canvasesRoot, entryPath)
  if (
    !relativePath ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath) ||
    !entryPath.endsWith(".canvas.tsx")
  ) {
    throw new Error(
      "Canvas file must be an agent-html/canvases/**/*.canvas.tsx file"
    )
  }
  return entryPath
}

async function readCanvasLayout({ filePath, root }) {
  const entryPath = resolveCanvasEntryPath({ filePath, root })
  await fs.access(entryPath)
  const layoutPath = canvasLayoutPathForEntry(entryPath)
  return readStoredCanvasLayout(layoutPath, {
    legacyLayoutPath: legacyCanvasLayoutPathForEntry(entryPath),
  })
}

async function writeCanvasLayout({ filePath, layout, root }) {
  const entryPath = resolveCanvasEntryPath({ filePath, root })
  await fs.access(entryPath)
  const layoutPath = canvasLayoutPathForEntry(entryPath)
  return writeStoredCanvasLayout({ layout, layoutPath })
}

async function patchCanvasLayout({ filePath, nodes, removedNodeIds, root }) {
  const entryPath = resolveCanvasEntryPath({ filePath, root })
  await fs.access(entryPath)
  const layoutPath = canvasLayoutPathForEntry(entryPath)
  return patchStoredCanvasLayout({ layoutPath, nodes, removedNodeIds })
}

const canvasHierarchyMutationQueues = new Map()

function queueCanvasHierarchyMutation(entryPath, operation) {
  const previous =
    canvasHierarchyMutationQueues.get(entryPath) ?? Promise.resolve()
  const next = previous.catch(() => undefined).then(operation)
  canvasHierarchyMutationQueues.set(entryPath, next)
  return next.finally(() => {
    if (canvasHierarchyMutationQueues.get(entryPath) === next) {
      canvasHierarchyMutationQueues.delete(entryPath)
    }
  })
}

async function replaceTextFile(filePath, source) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`
  try {
    await fs.writeFile(temporaryPath, source, "utf8")
    await fs.rename(temporaryPath, filePath)
  } finally {
    await fs.rm(temporaryPath, { force: true }).catch(() => undefined)
  }
}

async function reparentCanvasNodes({ filePath, nodeIds, parentId, root }) {
  const entryPath = resolveCanvasEntryPath({ filePath, root })
  await fs.access(entryPath)
  return queueCanvasHierarchyMutation(entryPath, async () => {
    const sourceFilePath = workspaceRelativePath(root, entryPath)
    const source = await readTextFile(entryPath)
    const intent = extractStaticCanvasIntent({
      filePath: sourceFilePath,
      source,
    })
    const layoutPath = canvasLayoutPathForEntry(entryPath)
    const stored = await readStoredCanvasLayout(layoutPath, {
      legacyLayoutPath: legacyCanvasLayoutPathForEntry(entryPath),
    })
    const reparenting = resolveCanvasReparenting({
      layout: stored.layout,
      nodeIds,
      nodes: intent.nodes,
      parentId,
    })
    const replacement = reparentStaticCanvasNodes({
      nodeIds: reparenting.movedNodeIds,
      parentId: reparenting.parentId,
      source,
    })
    const currentSource = await readTextFile(entryPath)
    if (currentSource !== source) {
      const error = new Error(
        "Canvas source changed while the hierarchy operation was prepared"
      )
      error.code = "CANVAS_SOURCE_CHANGED"
      throw error
    }

    const nextLayout = {
      nodes: { ...stored.layout.nodes, ...reparenting.geometries },
      version: stored.layout.version,
    }
    await writeStoredCanvasLayout({ layout: nextLayout, layoutPath })
    try {
      await replaceTextFile(entryPath, replacement.source)
    } catch (error) {
      try {
        await writeStoredCanvasLayout({ layout: stored.layout, layoutPath })
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          "Canvas hierarchy source write and layout rollback both failed"
        )
      }
      throw error
    }

    return reparenting
  })
}

async function reorderCanvasNodes({ action, filePath, nodeIds, root }) {
  const entryPath = resolveCanvasEntryPath({ filePath, root })
  await fs.access(entryPath)
  return queueCanvasHierarchyMutation(entryPath, async () => {
    const sourceFilePath = workspaceRelativePath(root, entryPath)
    const source = await readTextFile(entryPath)
    const intent = extractStaticCanvasIntent({
      filePath: sourceFilePath,
      source,
    })
    const ordering = resolveCanvasLayerOrder({
      action,
      nodeIds,
      nodes: intent.nodes,
    })
    if (ordering.groups.length === 0) return ordering
    const replacement = reorderStaticCanvasNodes({
      groups: ordering.groups,
      source,
    })
    const currentSource = await readTextFile(entryPath)
    if (currentSource !== source) {
      const error = new Error(
        "Canvas source changed while the layer operation was prepared"
      )
      error.code = "CANVAS_SOURCE_CHANGED"
      throw error
    }
    await replaceTextFile(entryPath, replacement.source)
    return ordering
  })
}

const publicContentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".htm", "text/html; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
])

function contentTypeForPublicAsset(filePath) {
  return (
    publicContentTypes.get(path.extname(filePath).toLowerCase()) ??
    "application/octet-stream"
  )
}

function resolvePublicAssetPath({ root, requestPathname }) {
  const publicRoot = path.join(root, "agent-html", "public")
  const publicRelativePath = decodeURIComponent(
    requestPathname.slice(hostRoutes.publicAsset.length)
  )
  const resolvedPath = path.resolve(publicRoot, publicRelativePath)

  if (
    resolvedPath !== publicRoot &&
    !resolvedPath.startsWith(`${publicRoot}${path.sep}`)
  ) {
    throw new Error("Public asset path must stay inside agent-html/public")
  }

  return resolvedPath
}

function artifactPublicAssetMatch(requestPathname) {
  return /^\/__agent-html\/artifacts\/([a-z0-9]+(?:-[a-z0-9]+)*)\/public\/(.+)$/.exec(
    requestPathname
  )
}

function resolveArtifactPublicAssetPath({ root, requestPathname }) {
  const match = artifactPublicAssetMatch(requestPathname)

  if (!match) {
    throw new Error(
      "Artifact public asset path must match /__agent-html/artifacts/<artifact>/public/<path>"
    )
  }

  const [, artifactId, encodedRelativePath] = match
  const publicRoot = path.join(
    root,
    "agent-html",
    "artifacts",
    artifactId,
    "public"
  )
  const publicRelativePath = decodeURIComponent(encodedRelativePath)
  const resolvedPath = path.resolve(publicRoot, publicRelativePath)

  if (
    resolvedPath !== publicRoot &&
    !resolvedPath.startsWith(`${publicRoot}${path.sep}`)
  ) {
    throw new Error(
      "Artifact public asset path must stay inside artifact public directory"
    )
  }

  return resolvedPath
}

function assertArtifactEntryPath(root, filePath) {
  if (typeof filePath !== "string") {
    throw new Error("Artifact filePath is required")
  }

  const absolutePath = assertInsideAgentHtmlWorkspace(root, filePath)
  const artifactsRoot = path.join(path.resolve(root), "agent-html", "artifacts")

  if (
    !absolutePath.startsWith(`${artifactsRoot}${path.sep}`) ||
    !filePath.replaceAll("\\", "/").endsWith(".artifact.tsx")
  ) {
    throw new Error(
      "Artifact file must be an agent-html/artifacts/*.artifact.tsx file"
    )
  }

  return absolutePath
}

function normalizeArtifactFileName(nextFileName) {
  const trimmed = String(nextFileName ?? "").trim()
  const fileName = trimmed.endsWith(".artifact.tsx")
    ? trimmed
    : `${trimmed}.artifact.tsx`

  if (
    !trimmed ||
    fileName.includes("/") ||
    fileName.includes("\\") ||
    fileName === ".artifact.tsx" ||
    path.basename(fileName) !== fileName
  ) {
    throw new Error("Artifact filename must be a basename")
  }

  if (!fileName.endsWith(".artifact.tsx")) {
    throw new Error("Artifact filename must end with .artifact.tsx")
  }

  return fileName
}

function artifactNameFromEntryPath(entryPath) {
  return path.basename(entryPath).slice(0, -".artifact.tsx".length)
}

function assertArtifactBlockDirectoryPath({ artifactsRoot, entryPath }) {
  const directoryPath = path.join(
    path.dirname(entryPath),
    artifactNameFromEntryPath(entryPath)
  )

  if (
    !directoryPath.startsWith(`${artifactsRoot}${path.sep}`) ||
    path.dirname(directoryPath) !== path.dirname(entryPath)
  ) {
    throw new Error("Artifact block directory must stay beside the artifact")
  }

  return directoryPath
}

function resolveArtifactSourceUnit({ filePath, root }) {
  const entryPath = assertArtifactEntryPath(root, filePath)
  const artifactsRoot = path.join(path.resolve(root), "agent-html", "artifacts")
  const blockDirectoryPath = assertArtifactBlockDirectoryPath({
    artifactsRoot,
    entryPath,
  })

  return { blockDirectoryPath, entryPath }
}

function resolveRenamedArtifactPath({ root, sourceFilePath, nextFileName }) {
  const {
    blockDirectoryPath: sourceBlockDirectoryPath,
    entryPath: sourcePath,
  } = resolveArtifactSourceUnit({
    filePath: sourceFilePath,
    root,
  })
  const fileName = normalizeArtifactFileName(nextFileName)
  const targetPath = path.join(path.dirname(sourcePath), fileName)
  const artifactsRoot = path.join(path.resolve(root), "agent-html", "artifacts")

  if (
    !targetPath.startsWith(`${artifactsRoot}${path.sep}`) ||
    path.dirname(targetPath) !== path.dirname(sourcePath)
  ) {
    throw new Error("Renamed artifact must stay beside the original artifact")
  }

  const targetBlockDirectoryPath = assertArtifactBlockDirectoryPath({
    artifactsRoot,
    entryPath: targetPath,
  })

  return {
    sourceBlockDirectoryPath,
    sourcePath,
    targetBlockDirectoryPath,
    targetPath,
  }
}

async function pathExists(filePath) {
  return fs.stat(filePath).then(
    () => true,
    () => false
  )
}

async function readJsonBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return {}
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}

async function sendTransformedModule({ response, url, vite }) {
  let result

  try {
    result = await vite.transformRequest(url)
  } catch (error) {
    const transformError = new Error(formatTransformError({ error, url }))
    console.error(
      "[agent-html] module transform failed\n%s",
      transformError.message
    )
    sendError(response, transformError)
    return
  }

  if (!result) {
    sendNotFound(response)
    return
  }

  sendText(response, result.code, "text/javascript; charset=utf-8")
}

function formatTransformError({ error, url }) {
  const message = error instanceof Error ? error.message : String(error)
  const lines = [`Unable to transform module: ${url}`, message]

  if (error && typeof error === "object") {
    if (typeof error.plugin === "string" && error.plugin) {
      lines.push(`Plugin: ${error.plugin}`)
    }

    if (typeof error.id === "string" && error.id) {
      lines.push(`File: ${error.id}`)
    }
  }

  if (message.includes("spawn EPERM")) {
    lines.push(
      "Vite/esbuild could not spawn a worker process. Stop stale AgentHTML dev hosts, clear the agent-html-vite temp cache, and restart the dev host."
    )
  }

  return lines.join("\n")
}

function resolveProxiedFontUrl(requestUrl, { errorMessage, isAllowed }) {
  const resourceUrl = requestUrl.searchParams.get("url")

  if (!resourceUrl) {
    throw new Error("url is required")
  }

  let parsedUrl
  try {
    parsedUrl = new URL(resourceUrl)
  } catch {
    throw new Error("url must be an absolute URL")
  }

  if (parsedUrl.protocol !== "https:" || !isAllowed(parsedUrl)) {
    throw new Error(errorMessage)
  }

  return parsedUrl.toString()
}

function resolveProxiedFontStylesheetUrl(requestUrl) {
  return resolveProxiedFontUrl(requestUrl, {
    errorMessage: "Only approved font stylesheet URLs are allowed",
    isAllowed: (url) =>
      (url.hostname === "fonts.googleapis.com" && url.pathname === "/css2") ||
      (url.hostname === "fontsapi.zeoseven.com" &&
        url.pathname.endsWith("/result.css")),
  })
}

function resolveProxiedFontAssetUrl(requestUrl) {
  return resolveProxiedFontUrl(requestUrl, {
    errorMessage: "Only approved woff2 font asset URLs are allowed",
    isAllowed: (url) =>
      (url.hostname === "fonts.gstatic.com" ||
        url.hostname === "fontsapi.zeoseven.com") &&
      url.pathname.endsWith(".woff2"),
  })
}

function proxiedFontAssetHref(fontAssetUrl) {
  return `${hostRoutes.fontAsset}?url=${encodeURIComponent(fontAssetUrl)}`
}

function rewriteRelativeCssUrls(css, stylesheetUrl) {
  return css.replace(
    /url\(\s*(["']?)([^"')]+)\1\s*\)/g,
    (_match, _quote, rawUrl) => {
      let absoluteUrl
      try {
        absoluteUrl = new URL(rawUrl.trim(), stylesheetUrl)
      } catch {
        return 'url("")'
      }

      if (
        absoluteUrl.protocol !== "https:" ||
        !(
          (absoluteUrl.hostname === "fonts.gstatic.com" ||
            absoluteUrl.hostname === "fontsapi.zeoseven.com") &&
          absoluteUrl.pathname.endsWith(".woff2")
        )
      ) {
        return 'url("")'
      }

      return `url("${proxiedFontAssetHref(absoluteUrl.toString())}")`
    }
  )
}

async function sendFontStylesheet({ requestUrl, response }) {
  let stylesheetUrl

  try {
    stylesheetUrl = resolveProxiedFontStylesheetUrl(requestUrl)
  } catch (error) {
    sendError(response, error, 400)
    return
  }

  try {
    const fontResponse = await fetch(stylesheetUrl)
    const css = rewriteRelativeCssUrls(await fontResponse.text(), stylesheetUrl)

    response.writeHead(fontResponse.ok ? 200 : fontResponse.status, {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=600",
      "Content-Type": "text/css; charset=utf-8",
    })
    response.end(css || `/* Empty font stylesheet: ${stylesheetUrl} */`)
  } catch (error) {
    response.writeHead(502, {
      "Content-Type": "text/css; charset=utf-8",
    })
    response.end(`/* Unable to load font stylesheet: ${String(error)} */`)
  }
}

async function sendFontAsset({ requestUrl, response }) {
  let fontAssetUrl

  try {
    fontAssetUrl = resolveProxiedFontAssetUrl(requestUrl)
  } catch (error) {
    sendError(response, error, 400)
    return
  }

  try {
    const fontResponse = await fetch(fontAssetUrl)
    const fontBytes = Buffer.from(await fontResponse.arrayBuffer())

    response.writeHead(fontResponse.ok ? 200 : fontResponse.status, {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "font/woff2",
    })
    response.end(fontBytes)
  } catch (error) {
    response.writeHead(502, {
      "Content-Type": "text/plain; charset=utf-8",
    })
    response.end(`Unable to load font asset: ${String(error)}`)
  }
}

export function classifyDevServerRoute(pathname) {
  if (pathname === "/" || pathname === "/favicon.ico") {
    return "host-shell"
  }

  if (
    pathname === hostRoutes.hostEntry ||
    pathname === artifactEntryModulePath ||
    pathname === canvasEntryModulePath ||
    forbiddenRootAssetPattern.test(pathname) ||
    pathname === hostRoutes.artifactBundle ||
    pathname === hostRoutes.canvasBundle
  ) {
    return "runtime-module"
  }

  if (
    pathname === hostRoutes.hostStyles ||
    pathname === hostRoutes.fontStylesheet ||
    pathname === hostRoutes.fontAsset
  ) {
    return "styles-and-assets"
  }

  if (
    pathname.startsWith(hostRoutes.publicAsset) ||
    artifactPublicAssetMatch(pathname)
  ) {
    return "public-asset"
  }

  if (pathname === hostRoutes.artifacts) {
    return "artifact-registry-and-validation-report"
  }

  if (
    pathname === hostRoutes.canvases ||
    pathname === hostRoutes.canvasLayout ||
    pathname === hostRoutes.canvasReorder ||
    pathname === hostRoutes.canvasReparent
  ) {
    return "canvas-registry-and-layout"
  }

  if (pathname === hostRoutes.canvasInspection) {
    return "canvas-inspection"
  }

  if (
    pathname === hostRoutes.artifactCreate ||
    pathname === hostRoutes.artifactRename ||
    pathname === hostRoutes.artifactTitle ||
    pathname === hostRoutes.artifactDelete
  ) {
    return "artifact-source-mutation"
  }

  if (pathname === hostRoutes.blockImplementation) {
    return "block-lookup"
  }

  if (
    pathname === hostRoutes.codexThreads ||
    pathname === hostRoutes.codexTranscript ||
    pathname === hostRoutes.codexTurn
  ) {
    return "codex-bridge"
  }

  if (
    pathname === hostRoutes.runtimeHealth ||
    pathname === hostRoutes.runtimeShutdown
  ) {
    return "runtime-control"
  }

  return null
}

async function handleHostShellRoute({ request, requestUrl, response, vite }) {
  if (requestUrl.pathname === "/") {
    const html = await fs.readFile(path.join(hostRoot, "index.html"), "utf8")
    sendText(
      response,
      await vite.transformIndexHtml("/", html, request.url),
      "text/html; charset=utf-8"
    )
    return true
  }

  if (requestUrl.pathname === "/favicon.ico") {
    response.writeHead(204)
    response.end()
    return true
  }

  return false
}

async function handleRuntimeModuleRoute({ requestUrl, response, root, vite }) {
  if (requestUrl.pathname === hostRoutes.hostEntry) {
    await sendTransformedModule({
      response,
      url: hostEntryModulePath,
      vite,
    })
    return true
  }

  if (requestUrl.pathname === artifactEntryModulePath) {
    sendNotFound(response)
    return true
  }

  if (requestUrl.pathname === canvasEntryModulePath) {
    sendNotFound(response)
    return true
  }

  if (forbiddenRootAssetPattern.test(requestUrl.pathname)) {
    sendNotFound(response)
    return true
  }

  if (requestUrl.pathname === hostRoutes.artifactBundle) {
    const filePath = requestUrl.searchParams.get("filePath")
    const version = requestUrl.searchParams.get("v")
    if (!filePath) {
      sendError(response, "filePath is required", 400)
      return true
    }

    try {
      assertInsideAgentHtmlWorkspace(root, filePath)
    } catch (error) {
      sendError(response, error, 400)
      return true
    }

    await sendTransformedModule({
      response,
      url:
        `${artifactEntryModulePath}?filePath=${encodeURIComponent(filePath)}` +
        (version ? `&v=${encodeURIComponent(version)}` : ""),
      vite,
    })
    return true
  }

  if (requestUrl.pathname === hostRoutes.canvasBundle) {
    const filePath = requestUrl.searchParams.get("filePath")
    const version = requestUrl.searchParams.get("v")
    if (!filePath) {
      sendError(response, "filePath is required", 400)
      return true
    }
    try {
      resolveCanvasEntryPath({ filePath, root })
    } catch (error) {
      sendError(response, error, 400)
      return true
    }
    await sendTransformedModule({
      response,
      url:
        `${canvasEntryModulePath}?filePath=${encodeURIComponent(filePath)}` +
        (version ? `&v=${encodeURIComponent(version)}` : ""),
      vite,
    })
    return true
  }

  return false
}

async function handleStylesAndAssetsRoute({ requestUrl, response, root }) {
  if (requestUrl.pathname === hostRoutes.hostStyles) {
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": "text/css; charset=utf-8",
    })
    response.end(await loadHostStyles(root))
    return true
  }

  if (requestUrl.pathname === hostRoutes.fontStylesheet) {
    await sendFontStylesheet({ requestUrl, response })
    return true
  }

  if (requestUrl.pathname === hostRoutes.fontAsset) {
    await sendFontAsset({ requestUrl, response })
    return true
  }

  return false
}

async function handlePublicAssetRoute({ requestUrl, response, root }) {
  const artifactMatch = artifactPublicAssetMatch(requestUrl.pathname)

  if (requestUrl.pathname.startsWith(hostRoutes.publicAsset) || artifactMatch) {
    let filePath

    try {
      filePath = artifactMatch
        ? resolveArtifactPublicAssetPath({
            root,
            requestPathname: requestUrl.pathname,
          })
        : resolvePublicAssetPath({
            root,
            requestPathname: requestUrl.pathname,
          })
    } catch (error) {
      sendError(response, error, 400)
      return true
    }

    try {
      const content = await fs.readFile(filePath)
      sendText(response, content, contentTypeForPublicAsset(filePath))
    } catch {
      sendNotFound(response)
    }
    return true
  }

  return false
}

async function handleArtifactRegistryRoute({
  artifactRegistry,
  requestUrl,
  response,
}) {
  if (requestUrl.pathname === hostRoutes.artifacts) {
    if (requestUrl.searchParams.get("refresh") === "1") {
      await artifactRegistry.refresh({
        broadcast: false,
        reason: "artifact-poll",
      })
    }

    sendJson(response, artifactRegistry.getSnapshot())
    return true
  }

  return false
}

async function handleCanvasRegistryAndLayoutRoute({
  canvasRegistry,
  request,
  requestUrl,
  response,
  root,
}) {
  if (requestUrl.pathname === hostRoutes.canvases) {
    if (requestUrl.searchParams.get("refresh") === "1") {
      await canvasRegistry.refresh({ broadcast: false, reason: "canvas-poll" })
    }
    sendJson(response, canvasRegistry.getSnapshot())
    return true
  }

  if (requestUrl.pathname === hostRoutes.canvasReparent) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }
    try {
      const body = await readJsonBody(request)
      const result = await reparentCanvasNodes({
        filePath: body.filePath,
        nodeIds: body.nodeIds,
        parentId: body.parentId,
        root,
      })
      sendJson(response, result)
    } catch (error) {
      sendError(
        response,
        error,
        error?.code === "CANVAS_SOURCE_CHANGED" ? 409 : 400
      )
    }
    return true
  }

  if (requestUrl.pathname === hostRoutes.canvasReorder) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }
    try {
      const body = await readJsonBody(request)
      const result = await reorderCanvasNodes({
        action: body.action,
        filePath: body.filePath,
        nodeIds: body.nodeIds,
        root,
      })
      sendJson(response, result)
    } catch (error) {
      sendError(
        response,
        error,
        error?.code === "CANVAS_SOURCE_CHANGED" ? 409 : 400
      )
    }
    return true
  }

  if (requestUrl.pathname !== hostRoutes.canvasLayout) return false

  if (request.method === "GET") {
    const filePath = requestUrl.searchParams.get("filePath")
    if (!filePath) {
      sendError(response, "filePath is required", 400)
      return true
    }
    try {
      const result = await readCanvasLayout({ filePath, root })
      sendJson(response, {
        layout: result.layout,
        ...(result.legacyViewport
          ? { legacyViewport: result.legacyViewport }
          : {}),
      })
    } catch (error) {
      sendError(response, error, 400)
    }
    return true
  }

  if (request.method === "POST") {
    try {
      const body = await readJsonBody(request)
      const isPatch = Boolean(body.nodes) || Array.isArray(body.removedNodeIds)
      const result = isPatch
        ? await patchCanvasLayout({
            filePath: body.filePath,
            nodes: body.nodes,
            removedNodeIds: body.removedNodeIds,
            root,
          })
        : await writeCanvasLayout({
            filePath: body.filePath,
            layout: body.layout,
            root,
          })
      sendJson(
        response,
        isPatch
          ? {
              nodes: result.nodes,
              removedNodeIds: result.removedNodeIds,
            }
          : {
              layout: result.layout,
            }
      )
    } catch (error) {
      sendError(response, error, 400)
    }
    return true
  }

  sendError(response, "GET or POST is required", 405)
  return true
}

function readCanvasInspectionViewport(requestUrl) {
  const bounds = {}
  for (const field of ["x", "y", "width", "height"]) {
    if (!requestUrl.searchParams.has(field)) {
      throw new Error(`Canvas inspection viewport ${field} is required`)
    }
    bounds[field] = Number(requestUrl.searchParams.get(field))
  }
  return bounds
}

async function handleCanvasInspectionRoute({
  canvasInspectionRegistry,
  request,
  requestUrl,
  response,
  root,
}) {
  if (request.method === "POST") {
    try {
      const body = await readJsonBody(request)
      const filePath = body.document?.sourceFilePath
      const entryPath = resolveCanvasEntryPath({ filePath, root })
      await fs.access(entryPath)
      const document = canvasInspectionRegistry.publish(body.document)
      sendJson(response, {
        ok: true,
        sourceFilePath: document.sourceFilePath,
      })
    } catch (error) {
      sendError(response, error, 400)
    }
    return true
  }

  if (request.method !== "GET") {
    sendError(response, "GET or POST is required", 405)
    return true
  }

  const filePath = requestUrl.searchParams.get("filePath")
  if (!filePath) {
    sendError(response, "filePath is required", 400)
    return true
  }

  try {
    const entryPath = resolveCanvasEntryPath({ filePath, root })
    await fs.access(entryPath)
    const liveDocument = canvasInspectionRegistry.getDocument(filePath)
    let coldDocument = null
    try {
      coldDocument = await readColdCanvasInspectionDocument({
        entryPath,
        root,
        sourceFilePath: filePath,
      })
    } catch (error) {
      if (!liveDocument) throw error
    }
    const staticNodes = new Map(
      coldDocument?.nodes.map((node) => [node.id, node]) ?? []
    )
    const document = liveDocument
      ? {
          ...liveDocument,
          nodes: liveDocument.nodes.map((node) => {
            const staticNode = staticNodes.get(node.id)
            if (!staticNode) return node
            return {
              ...node,
              ...(staticNode.parentId
                ? { parentId: staticNode.parentId }
                : { parentId: undefined }),
              siblingOrder: staticNode.siblingOrder,
              sources: staticNode.sources,
            }
          }),
        }
      : coldDocument
    const origin = liveDocument ? "live" : "cold"

    const kind = requestUrl.searchParams.get("kind") ?? "overview"
    let result
    if (kind === "overview") {
      result = inspectCanvasOverview(document)
    } else if (kind === "viewport") {
      result = inspectCanvasViewport(
        document,
        readCanvasInspectionViewport(requestUrl)
      )
    } else if (kind === "node" || kind === "source") {
      const nodeId = requestUrl.searchParams.get("nodeId")
      if (!nodeId) throw new Error("Canvas inspection nodeId is required")
      result =
        kind === "node"
          ? inspectCanvasNode(document, nodeId)
          : resolveCanvasNodeSource(document, nodeId)
      if (!result) {
        sendError(response, `Canvas Node ${nodeId} was not found`, 404)
        return true
      }
    } else {
      throw new Error(`Unsupported Canvas inspection kind: ${kind}`)
    }

    sendJson(response, { kind, origin, result, sourceFilePath: filePath })
  } catch (error) {
    sendError(response, error, 400)
  }
  return true
}

async function handleArtifactSourceMutationRoute({
  artifactRegistry,
  request,
  requestUrl,
  response,
  root,
}) {
  if (requestUrl.pathname === hostRoutes.artifactCreate) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }

    try {
      const body = await readJsonBody(request)
      const requestText = typeof body.request === "string" ? body.request : ""
      const { blockDirectoryPath, entryPath } = resolveArtifactSourceUnit({
        filePath: body.filePath,
        root,
      })

      if (!requestText.trim()) {
        throw new Error("Artifact request is required")
      }

      if (await pathExists(entryPath)) {
        throw new Error("Artifact file already exists")
      }

      await fs.mkdir(path.dirname(entryPath), { recursive: true })
      await fs.writeFile(
        entryPath,
        createArtifactScaffold({
          entryPath,
          request: requestText,
        }),
        "utf8"
      )
      await fs.mkdir(blockDirectoryPath, { recursive: true })
      await fs.writeFile(
        path.join(blockDirectoryPath, "overview.block.tsx"),
        [
          "export default function OverviewBlock() {",
          "  return null",
          "}",
          "",
        ].join("\n"),
        "utf8"
      )
      await artifactRegistry.refresh({ reason: "artifact-create" })
      sendJson(response, {
        filePath: workspaceRelativePath(root, entryPath),
      })
    } catch (error) {
      sendError(response, error, 400)
    }
    return true
  }

  if (requestUrl.pathname === hostRoutes.artifactRename) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }

    try {
      const body = await readJsonBody(request)
      const {
        sourceBlockDirectoryPath,
        sourcePath,
        targetBlockDirectoryPath,
        targetPath,
      } = resolveRenamedArtifactPath({
        nextFileName: body.nextFileName,
        root,
        sourceFilePath: body.filePath,
      })
      const [
        targetExists,
        sourceBlockDirectoryExists,
        targetBlockDirectoryExists,
      ] = await Promise.all([
        pathExists(targetPath),
        pathExists(sourceBlockDirectoryPath),
        pathExists(targetBlockDirectoryPath),
      ])

      if (targetExists) {
        throw new Error("Artifact filename already exists")
      }

      if (targetBlockDirectoryExists) {
        throw new Error("Artifact block directory already exists")
      }

      await fs.rename(sourcePath, targetPath)
      if (sourceBlockDirectoryExists) {
        await fs.rename(sourceBlockDirectoryPath, targetBlockDirectoryPath)
      }
      await artifactRegistry.refresh({ reason: "artifact-rename" })
      sendJson(response, {
        filePath: workspaceRelativePath(root, targetPath),
      })
    } catch (error) {
      sendError(response, error, 400)
    }
    return true
  }

  if (requestUrl.pathname === hostRoutes.artifactTitle) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }

    try {
      const body = await readJsonBody(request)
      const filePath = typeof body.filePath === "string" ? body.filePath : ""
      const { entryPath } = resolveArtifactSourceUnit({ filePath, root })
      const source = await readTextFile(entryPath)
      const replacement = replaceArtifactTitle({
        filePath: workspaceRelativePath(root, entryPath),
        source,
        title: body.title,
      })

      await fs.writeFile(entryPath, replacement.source, "utf8")
      await artifactRegistry.refresh({ reason: "artifact-title-rename" })
      sendJson(response, {
        filePath: workspaceRelativePath(root, entryPath),
        title: replacement.title,
      })
    } catch (error) {
      sendError(response, error, 400)
    }
    return true
  }

  if (requestUrl.pathname === hostRoutes.artifactDelete) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }

    try {
      const body = await readJsonBody(request)
      const filePath = typeof body.filePath === "string" ? body.filePath : ""
      const { blockDirectoryPath, entryPath } = resolveArtifactSourceUnit({
        filePath,
        root,
      })

      await fs.rm(entryPath)
      await fs.rm(blockDirectoryPath, { force: true, recursive: true })
      await artifactRegistry.refresh({ reason: "artifact-delete" })
      sendJson(response, { ok: true })
    } catch (error) {
      sendError(response, error, 400)
    }
    return true
  }

  return false
}

async function handleBlockLookupRoute({ requestUrl, response, root }) {
  if (requestUrl.pathname === hostRoutes.blockImplementation) {
    const filePath = requestUrl.searchParams.get("filePath")
    const blockId = requestUrl.searchParams.get("blockId")
    if (!filePath || !blockId) {
      sendError(response, "filePath and blockId are required", 400)
      return true
    }

    let absolutePath
    try {
      absolutePath = assertInsideAgentHtmlWorkspace(root, filePath)
    } catch (error) {
      sendError(response, error, 400)
      return true
    }

    await readTextFile(absolutePath)
    const implementationPath = await resolveBlockImplementationPath({
      blockId,
      filePath,
      root,
    })
    sendJson(response, {
      implementationPath,
    })
    return true
  }

  return false
}

async function handleCodexBridgeRoute({ request, requestUrl, response, root }) {
  if (requestUrl.pathname === hostRoutes.codexThreads) {
    sendJson(response, await listCodexThreads({ root }))
    return true
  }

  if (requestUrl.pathname === hostRoutes.codexTranscript) {
    const threadId = requestUrl.searchParams.get("threadId")
    if (!threadId) {
      sendError(response, "threadId is required", 400)
      return true
    }

    sendJson(response, await readCodexThreadTranscript({ threadId }))
    return true
  }

  if (requestUrl.pathname === hostRoutes.codexTurn) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }

    const body = await readJsonBody(request)
    const prompt = typeof body.prompt === "string" ? body.prompt : ""
    const threadId =
      typeof body.threadId === "string" && body.threadId.trim()
        ? body.threadId
        : null

    if (!prompt.trim()) {
      sendError(response, "prompt is required", 400)
      return true
    }

    sendJson(response, await startCodexTurn({ prompt, root, threadId }))
    return true
  }

  return false
}

async function handleRuntimeControlRoute({
  request,
  requestUrl,
  response,
  runtimeControl,
}) {
  if (requestUrl.pathname === hostRoutes.runtimeHealth) {
    sendJson(response, {
      ok: true,
      pid: process.pid,
      protocolVersion: runtimeProtocolVersion,
      startedAt: runtimeControl?.startedAt ?? null,
      uptimeMs: runtimeControl?.startedAt
        ? Date.now() - runtimeControl.startedAt
        : 0,
      workspaceRoot: runtimeControl?.root ?? null,
    })
    return true
  }

  if (requestUrl.pathname === hostRoutes.runtimeShutdown) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }

    if (!requireRuntimeShutdown(runtimeControl, response)) {
      return true
    }

    sendJson(response, { ok: true })
    setImmediate(() => runtimeControl.requestShutdown())
    return true
  }

  return false
}

const routePipelineHandlers = {
  "artifact-registry-and-validation-report": handleArtifactRegistryRoute,
  "artifact-source-mutation": handleArtifactSourceMutationRoute,
  "canvas-registry-and-layout": handleCanvasRegistryAndLayoutRoute,
  "canvas-inspection": handleCanvasInspectionRoute,
  "block-lookup": handleBlockLookupRoute,
  "codex-bridge": handleCodexBridgeRoute,
  "host-shell": handleHostShellRoute,
  "public-asset": handlePublicAssetRoute,
  "runtime-module": handleRuntimeModuleRoute,
  "runtime-control": handleRuntimeControlRoute,
  "styles-and-assets": handleStylesAndAssetsRoute,
}

export async function handleRequest({
  artifactRegistry,
  canvasInspectionRegistry,
  canvasRegistry,
  request,
  response,
  root,
  runtimeControl,
  vite,
}) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost")
  const pipeline = classifyDevServerRoute(requestUrl.pathname)

  if (!pipeline) {
    if (requestUrl.pathname.startsWith("/__agent-html/")) {
      sendNotFound(response)
      return true
    }

    return false
  }

  return routePipelineHandlers[pipeline]({
    artifactRegistry,
    canvasInspectionRegistry,
    canvasRegistry,
    request,
    requestUrl,
    response,
    root,
    runtimeControl,
    vite,
  })
}
