import http from "node:http"

import { parseRootArg } from "../react-canvas/paths.mjs"
import { createAgentHtmlViteServer } from "./vite.mjs"

export async function runRuntimePrepareCommand({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const server = http.createServer()
  const vite = await createAgentHtmlViteServer({
    pipeline: "example",
    root,
    server,
  })
  await vite.close()
  console.log("Canvas browser dependency cache is ready")
}
