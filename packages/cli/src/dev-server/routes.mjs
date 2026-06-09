import fs from "node:fs/promises"
import path from "node:path"

import { workspaceRelativePath } from "../react-canvas/paths.mjs"
import { resolveBlockImplementationPath } from "../react-canvas/block-implementation.mjs"
import { readTextFile } from "../react-canvas/workspace-file.mjs"
import {
  listCodexThreads,
  readCodexThreadTranscript,
  startCodexTurn,
} from "./codex-bridge.mjs"
import { hostRoot } from "./context.mjs"
import { sendError, sendJson, sendNotFound, sendText } from "./http.mjs"
import { loadHostStyles } from "./styles.mjs"
import { assertInsideAgentHtmlWorkspace } from "./workspace.mjs"
import { artifactEntryModulePath, hostEntryModulePath } from "./vite.mjs"

export const hostRoutes = {
  artifactBundle: "/__agent-html/artifact.js",
  artifactDelete: "/__agent-html/artifact/delete",
  artifactRename: "/__agent-html/artifact/rename",
  artifacts: "/__agent-html/artifacts",
  blockImplementation: "/__agent-html/block-implementation",
  codexThreads: "/__agent-html/codex/threads",
  codexTranscript: "/__agent-html/codex/transcript",
  codexTurn: "/__agent-html/codex/turn",
  fontAsset: "/__agent-html/font-asset",
  fontStylesheet: "/__agent-html/font-stylesheet",
  hostEntry: "/__agent-html/host-entry.js",
  publicAsset: "/__agent-html/public/",
  hostStyles: "/__agent-html/styles.css",
}

const removedLegacyRoutes = new Set(["/client.js", "/styles.css"])

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
  return publicContentTypes.get(path.extname(filePath).toLowerCase()) ??
    "application/octet-stream"
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
    throw new Error("Artifact file must be an agent-html/artifacts/*.artifact.tsx file")
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

function resolveRenamedArtifactPath({ root, sourceFilePath, nextFileName }) {
  const sourcePath = assertArtifactEntryPath(root, sourceFilePath)
  const fileName = normalizeArtifactFileName(nextFileName)
  const targetPath = path.join(path.dirname(sourcePath), fileName)
  const artifactsRoot = path.join(path.resolve(root), "agent-html", "artifacts")

  if (
    !targetPath.startsWith(`${artifactsRoot}${path.sep}`) ||
    path.dirname(targetPath) !== path.dirname(sourcePath)
  ) {
    throw new Error("Renamed artifact must stay beside the original artifact")
  }

  return { sourcePath, targetPath }
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
    console.error("[agent-html] module transform failed\n%s", transformError.message)
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

function resolveProxiedZeosevenUrl(requestUrl, { errorMessage, pathnameTest }) {
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

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== "fontsapi.zeoseven.com" ||
    !pathnameTest(parsedUrl.pathname)
  ) {
    throw new Error(errorMessage)
  }

  return parsedUrl.toString()
}

function resolveProxiedFontStylesheetUrl(requestUrl) {
  return resolveProxiedZeosevenUrl(requestUrl, {
    errorMessage: "Only ZeoSeven FontsAPI result.css URLs are allowed",
    pathnameTest: (pathname) => pathname.endsWith("/result.css"),
  })
}

function resolveProxiedFontAssetUrl(requestUrl) {
  return resolveProxiedZeosevenUrl(requestUrl, {
    errorMessage: "Only ZeoSeven FontsAPI woff2 URLs are allowed",
    pathnameTest: (pathname) => pathname.endsWith(".woff2"),
  })
}

function proxiedFontAssetHref(fontAssetUrl) {
  return `${hostRoutes.fontAsset}?url=${encodeURIComponent(fontAssetUrl)}`
}

function rewriteRelativeCssUrls(css, stylesheetUrl) {
  return css.replace(
    /url\(\s*(["']?)(?![a-zA-Z][a-zA-Z\d+.-]*:|\/\/|#)([^"')]+)\1\s*\)/g,
    (_match, _quote, rawUrl) => {
      const absoluteUrl = new URL(rawUrl.trim(), stylesheetUrl).toString()
      return `url("${proxiedFontAssetHref(absoluteUrl)}")`
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

export async function handleRequest({ artifactRegistry, request, response, root, vite }) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost")

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

  if (removedLegacyRoutes.has(requestUrl.pathname)) {
    sendNotFound(response)
    return true
  }

  if (requestUrl.pathname === hostRoutes.hostStyles) {
    sendText(response, await loadHostStyles(root), "text/css; charset=utf-8")
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

  if (requestUrl.pathname.startsWith(hostRoutes.publicAsset)) {
    let filePath

    try {
      filePath = resolvePublicAssetPath({
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

  if (requestUrl.pathname === hostRoutes.artifacts) {
    sendJson(response, artifactRegistry.getSnapshot())
    return true
  }

  if (requestUrl.pathname === hostRoutes.artifactBundle) {
    const filePath = requestUrl.searchParams.get("filePath")
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
      url: `${artifactEntryModulePath}?filePath=${encodeURIComponent(filePath)}`,
      vite,
    })
    return true
  }

  if (requestUrl.pathname === hostRoutes.artifactRename) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return true
    }

    try {
      const body = await readJsonBody(request)
      const { sourcePath, targetPath } = resolveRenamedArtifactPath({
        nextFileName: body.nextFileName,
        root,
        sourceFilePath: body.filePath,
      })
      const targetExists = await fs.stat(targetPath).then(
        () => true,
        () => false
      )

      if (targetExists) {
        throw new Error("Artifact filename already exists")
      }

      await fs.rename(sourcePath, targetPath)
      await artifactRegistry.refresh({ reason: "artifact-rename" })
      sendJson(response, {
        filePath: workspaceRelativePath(root, targetPath),
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
      const absolutePath = assertArtifactEntryPath(root, filePath)

      await fs.rm(absolutePath)
      await artifactRegistry.refresh({ reason: "artifact-delete" })
      sendJson(response, { ok: true })
    } catch (error) {
      sendError(response, error, 400)
    }
    return true
  }

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
