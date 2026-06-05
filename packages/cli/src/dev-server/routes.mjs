import fs from "node:fs/promises"
import path from "node:path"

import { discoverReactArtifacts, workspaceRelativePath } from "../react-canvas/paths.mjs"
import { runGuard } from "../react-canvas/guard.mjs"
import {
  readTextFile,
  resolveBlockImplementationPath,
} from "../react-canvas/source.mjs"
import { hostRoot } from "./context.mjs"
import { buildArtifactBundle, buildHostBundle } from "./bundler.mjs"
import { sendError, sendJson, sendNotFound, sendText } from "./http.mjs"
import { loadHostStyles } from "./styles.mjs"
import { assertInsideWorkspace } from "./workspace.mjs"

export const hostRoutes = {
  artifactBundle: "/__agent-html/artifact.js",
  artifacts: "/__agent-html/artifacts",
  blockSource: "/__agent-html/block-source",
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
  const publicRoot = path.join(root, ".agent-html", "public")
  const publicRelativePath = decodeURIComponent(
    requestPathname.slice(hostRoutes.publicAsset.length)
  )
  const resolvedPath = path.resolve(publicRoot, publicRelativePath)

  if (
    resolvedPath !== publicRoot &&
    !resolvedPath.startsWith(`${publicRoot}${path.sep}`)
  ) {
    throw new Error("Public asset path must stay inside .agent-html/public")
  }

  return resolvedPath
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

  if (requestUrl.pathname === hostRoutes.blockSource) {
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

  sendNotFound(response)
}
