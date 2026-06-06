import http from "node:http"

import { parseRootArg } from "../react-canvas/paths.mjs"
import { stopCodexBridge } from "./codex-bridge.mjs"
import { sendError } from "./http.mjs"
import { handleRequest } from "./routes.mjs"
import { createAgentHtmlViteServer } from "./vite.mjs"

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

async function waitForViteRuntimeIdle(vite) {
  await vite.waitForRequestsIdle()

  const optimizerPromises = Object.values(vite.environments ?? {}).flatMap(
    (environment) => {
      const optimizer = environment.depsOptimizer
      if (!optimizer) {
        return []
      }

      const discoveredProcessing = Object.values(
        optimizer.metadata?.discovered ?? {}
      )
        .map((dependency) => dependency.processing)
        .filter(Boolean)

      return [optimizer.scanProcessing, ...discoveredProcessing].filter(Boolean)
    }
  )

  await Promise.allSettled(optimizerPromises)
  await vite.waitForRequestsIdle()
}

export async function startDevHost({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const port = parsePortArg(args)
  const server = http.createServer()
  const vite = await createAgentHtmlViteServer({ root, server })
  const closeHttpServer = server.close.bind(server)
  let closeRuntimePromise = null

  function closeRuntime() {
    if (!closeRuntimePromise) {
      closeRuntimePromise = (async () => {
        await waitForViteRuntimeIdle(vite)
        await vite.close()
        await stopCodexBridge()
      })()
    }

    return closeRuntimePromise
  }

  server.close = (callback) => {
    closeHttpServer((error) => {
      closeRuntime().then(
        () => callback?.(error),
        (closeError) => callback?.(closeError)
      )
    })

    return server
  }

  server.on("request", (request, response) => {
    handleRequest({ request, response, root, vite }).then(
      (handled) => {
        if (handled) {
          return
        }

        vite.middlewares(request, response, (error) => {
          if (error) {
            vite.ssrFixStacktrace(error)
            sendError(response, error)
            return
          }

          sendError(response, "Not found", 404)
        })
      },
      (error) => {
        vite.ssrFixStacktrace(error)
        sendError(response, error)
      }
    )
  })
  server.on("close", () => {
    void closeRuntime()
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
