import fs from "node:fs/promises"
import path from "node:path"

import { discoverReactArtifacts, workspaceRelativePath } from "../react-canvas/paths.mjs"
import { runGuard } from "../react-canvas/guard.mjs"
import { resolveBlockImplementationPath } from "../react-canvas/block-implementation.mjs"
import { readTextFile } from "../react-canvas/workspace-file.mjs"
import {
  listCodexThreads,
  readCodexThreadTranscript,
  startCodexTurn,
} from "./codex-bridge.mjs"
import { hostRoot } from "./context.mjs"
import { buildArtifactBundle, buildHostBundle } from "./bundler.mjs"
import { sendError, sendJson, sendNotFound, sendText } from "./http.mjs"
import { loadHostStyles } from "./styles.mjs"
import { assertInsideWorkspace } from "./workspace.mjs"

export const hostRoutes = {
  artifactBundle: "/__agent-html/artifact.js",
  artifacts: "/__agent-html/artifacts",
  blockImplementation: "/__agent-html/block-implementation",
  codexThreads: "/__agent-html/codex/threads",
  codexTranscript: "/__agent-html/codex/transcript",
  codexTurn: "/__agent-html/codex/turn",
  hostBundle: "/__agent-html/host.js",
  publicAsset: "/__agent-html/public/",
  hostStyles: "/__agent-html/styles.css",
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

export async function handleRequest({ request, response, root }) {
  const requestUrl = new URL(request.url ?? "/", "http://localhost")

  if (requestUrl.pathname === "/") {
    const html = await fs.readFile(path.join(hostRoot, "index.html"), "utf8")
    sendText(response, html, "text/html; charset=utf-8")
    return
  }

  if (requestUrl.pathname === "/favicon.ico") {
    response.writeHead(204)
    response.end()
    return
  }

  if (requestUrl.pathname === hostRoutes.hostBundle) {
    sendText(response, await buildHostBundle({ root }), "text/javascript; charset=utf-8")
    return
  }

  if (requestUrl.pathname === hostRoutes.hostStyles) {
    sendText(response, await loadHostStyles(root), "text/css; charset=utf-8")
    return
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
      return
    }

    try {
      const content = await fs.readFile(filePath)
      sendText(response, content, contentTypeForPublicAsset(filePath))
    } catch {
      sendNotFound(response)
    }
    return
  }

  if (requestUrl.pathname === hostRoutes.artifacts) {
    const artifacts = await discoverReactArtifacts(root)
    const guard = await runGuard({ root })
    sendJson(response, {
      artifacts: artifacts.map((filePath) => ({
        filePath: workspaceRelativePath(root, filePath),
      })),
      guardIssues: guard.issues,
    })
    return
  }

  if (requestUrl.pathname === hostRoutes.artifactBundle) {
    const filePath = requestUrl.searchParams.get("filePath")
    if (!filePath) {
      sendError(response, "filePath is required", 400)
      return
    }

    sendText(
      response,
      await buildArtifactBundle({ filePath, root }),
      "text/javascript; charset=utf-8"
    )
    return
  }

  if (requestUrl.pathname === hostRoutes.blockImplementation) {
    const filePath = requestUrl.searchParams.get("filePath")
    const blockId = requestUrl.searchParams.get("blockId")
    if (!filePath || !blockId) {
      sendError(response, "filePath and blockId are required", 400)
      return
    }

    const absolutePath = assertInsideWorkspace(root, filePath)
    await readTextFile(absolutePath)
    const implementationPath = await resolveBlockImplementationPath({
      blockId,
      filePath,
      root,
    })
    sendJson(response, {
      implementationPath,
    })
    return
  }

  if (requestUrl.pathname === hostRoutes.codexThreads) {
    sendJson(response, await listCodexThreads({ root }))
    return
  }

  if (requestUrl.pathname === hostRoutes.codexTranscript) {
    const threadId = requestUrl.searchParams.get("threadId")
    if (!threadId) {
      sendError(response, "threadId is required", 400)
      return
    }

    sendJson(response, await readCodexThreadTranscript({ threadId }))
    return
  }

  if (requestUrl.pathname === hostRoutes.codexTurn) {
    if (request.method !== "POST") {
      sendError(response, "POST is required", 405)
      return
    }

    const body = await readJsonBody(request)
    const prompt = typeof body.prompt === "string" ? body.prompt : ""
    const threadId =
      typeof body.threadId === "string" && body.threadId.trim()
        ? body.threadId
        : null

    if (!prompt.trim()) {
      sendError(response, "prompt is required", 400)
      return
    }

    sendJson(response, await startCodexTurn({ prompt, root, threadId }))
    return
  }

  sendNotFound(response)
}
