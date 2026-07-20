import http from "node:http"

import { parseRootArg } from "../react-canvas/paths.mjs"
import { stopCodexBridge } from "./codex-bridge.mjs"
import { createArtifactRegistry } from "./artifact-registry.mjs"
import { sendError } from "./http.mjs"
import { handleRequest } from "./routes.mjs"
import {
  createRuntimeSession,
  runtimeProtocolVersion,
} from "./runtime-session.mjs"
import { createAgentHtmlViteServer } from "./vite.mjs"

export function parsePortArg(args) {
  const portIndex = args.indexOf("--port")
  if (portIndex === -1) {
    return {
      explicit: false,
      port: 5177,
    }
  }

  const value = Number(args[portIndex + 1])
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error("--port requires a positive integer")
  }

  return {
    explicit: true,
    port: value,
  }
}

export function parsePipelineArg(args) {
  const pipelineIndex = args.indexOf("--pipeline")
  if (pipelineIndex === -1) {
    return "codex"
  }

  const pipeline = args[pipelineIndex + 1]
  if (pipeline !== "codex" && pipeline !== "example") {
    throw new Error("--pipeline requires either codex or example")
  }

  return pipeline
}

function isAddressInUseError(error) {
  return error && error.code === "EADDRINUSE"
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    function cleanup() {
      server.off("error", onError)
    }

    function onError(error) {
      cleanup()
      reject(error)
    }

    server.once("error", onError)
    server.listen(port, "127.0.0.1", () => {
      cleanup()
      const address = server.address()
      if (!address || typeof address === "string") {
        reject(new Error("Unable to resolve the runtime port"))
        return
      }
      resolve(address.port)
    })
  })
}

async function listenWithPortFallback({ server, port, explicit }) {
  const maxAttempts = explicit ? 1 : 20

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidatePort = port + attempt

    try {
      return await listen(server, candidatePort)
    } catch (error) {
      if (!isAddressInUseError(error)) {
        throw error
      }

      if (explicit) {
        throw new Error(
          `Port ${candidatePort} is already in use. Try agent-html dev --port <other-port>.`
        )
      }
    }
  }

  throw new Error(
    `No available port found from ${port} to ${port + maxAttempts - 1}. Try agent-html dev --port <port>.`
  )
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

export async function startDevHost({ args, cwd, runtime = {} }) {
  const root = parseRootArg({ args, cwd })
  const portConfig = Number.isInteger(runtime.port)
    ? { explicit: true, port: runtime.port }
    : parsePortArg(args)
  const pipeline = parsePipelineArg(args)
  const runtimeSession = createRuntimeSession({ token: runtime.authToken })
  const startedAt = Date.now()
  const server = http.createServer()
  const vite = await createAgentHtmlViteServer({ pipeline, root, server })
  const artifactRegistry = createArtifactRegistry({ root, vite })
  await artifactRegistry.start()
  const closeHttpServer = server.close.bind(server)
  let closeRuntimePromise = null

  function closeRuntime() {
    if (!closeRuntimePromise) {
      closeRuntimePromise = (async () => {
        await waitForViteRuntimeIdle(vite)
        await artifactRegistry.close()
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

  const runtimeControl = {
    allowShutdown: runtime.allowShutdown === true,
    requestShutdown: () => server.close(() => {}),
    root,
    startedAt,
  }

  server.on("request", (request, response) => {
    if (!runtimeSession.authorize({ request, response })) {
      return
    }

    handleRequest({
      artifactRegistry,
      request,
      response,
      root,
      runtimeControl,
      vite,
    }).then(
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

  let port
  try {
    port = await listenWithPortFallback({ server, ...portConfig })
  } catch (error) {
    await closeRuntime()
    throw error
  }

  const url = `http://127.0.0.1:${port}`
  const bootstrapUrl = runtimeSession.bootstrapUrl(url)
  if (runtime.machineReadable) {
    runtime.writeLine?.(
      JSON.stringify({
        type: "runtime-ready",
        bootstrapUrl,
        pid: process.pid,
        pipeline,
        protocolVersion: runtimeProtocolVersion,
        root,
        url,
      })
    )
  } else {
    console.log(`AgentHTML React Canvas host running at ${url}`)
    console.log(`Workspace root: ${root}`)
  }

  if (process.env.AGENT_HTML_DEV_ONCE === "1") {
    await new Promise((resolve) => server.close(resolve))
  }

  return {
    bootstrapUrl,
    pipeline,
    protocolVersion: runtimeProtocolVersion,
    root,
    server,
    url,
  }
}
