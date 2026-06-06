import http from "node:http"

import { parseRootArg } from "../react-canvas/paths.mjs"
import { stopCodexBridge } from "./codex-bridge.mjs"
import { sendError } from "./http.mjs"
import { handleRequest } from "./routes.mjs"

export function parsePortArg(args) {
  const portIndex = args.indexOf("--port")
  if (portIndex === -1) {
    return 5177
  }

  const value = Number(args[portIndex + 1])
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("--port requires a positive integer")
  }

  return value
}

export async function startDevHost({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const port = parsePortArg(args)
  const server = http.createServer((request, response) => {
    handleRequest({ request, response, root }).catch((error) => {
      sendError(response, error)
    })
  })
  server.on("close", () => {
    void stopCodexBridge()
  })

  await new Promise((resolve) => {
    server.listen(port, "127.0.0.1", resolve)
  })

  const url = `http://127.0.0.1:${port}`
  console.log(`AgentHTML React Canvas host running at ${url}`)
  console.log(`Workspace root: ${root}`)

  if (process.env.AGENT_HTML_DEV_ONCE === "1") {
    await new Promise((resolve) => server.close(resolve))
  }

  return {
    root,
    server,
    url,
  }
}
