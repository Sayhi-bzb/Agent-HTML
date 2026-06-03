import fs from "node:fs/promises"
import path from "node:path"

import { discoverReactArtifacts, workspaceRelativePath } from "../react-canvas/paths.mjs"
import { runGuard } from "../react-canvas/guard.mjs"
import { extractBlockSource, readTextFile } from "../react-canvas/source.mjs"
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
  hostStyles: "/__agent-html/styles.css",
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
    const source = await readTextFile(absolutePath)
    sendJson(response, {
      selectedSource: extractBlockSource(source, blockId),
    })
    return
  }

  sendNotFound(response)
}
