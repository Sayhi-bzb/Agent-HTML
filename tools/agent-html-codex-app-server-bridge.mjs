import http from "node:http"
import { appendFile } from "node:fs/promises"
import { spawn } from "node:child_process"

const host = process.env.AGENT_HTML_BRIDGE_HOST ?? "127.0.0.1"
const configuredPort = Number.parseInt(
  process.env.AGENT_HTML_BRIDGE_PORT ?? "51279",
  10
)
const port =
  Number.isInteger(configuredPort) && configuredPort >= 0 && configuredPort < 65536
    ? configuredPort
    : 51279
const codexCommand =
  process.env.AGENT_HTML_CODEX_COMMAND ??
  (process.platform === "win32" ? "codex.cmd" : "codex")
const codexArgs = ["app-server", "--listen", "stdio://"]
const cwd = process.env.AGENT_HTML_CODEX_CWD ?? process.cwd()
const eventLogPath = process.env.AGENT_HTML_EVENT_LOG
const codexEventLogPath = process.env.AGENT_HTML_CODEX_EVENT_LOG

let nextRequestId = 1
let threadId = null
let initialized = false
let appServerClosed = false
let stdoutBuffer = ""
const pendingRequests = new Map()

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  })
  response.end(JSON.stringify(payload))
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = ""

    request.setEncoding("utf8")
    request.on("data", (chunk) => {
      body += chunk
    })
    request.on("end", () => {
      resolve(body)
    })
    request.on("error", reject)
  })
}

async function appendJsonLine(path, payload) {
  if (!path) {
    return
  }

  await appendFile(path, `${JSON.stringify(payload)}\n`, "utf8")
}

function createCodexProcess() {
  const quotedCommand = codexCommand.includes(" ")
    ? `"${codexCommand}"`
    : codexCommand
  const windowsCommand = [quotedCommand, ...codexArgs].join(" ")
  const child =
    process.platform === "win32"
      ? spawn(
          process.env.ComSpec ?? "cmd.exe",
          ["/d", "/s", "/c", windowsCommand],
          {
            cwd,
            env: process.env,
            stdio: ["pipe", "pipe", "pipe"],
          }
        )
      : spawn(codexCommand, codexArgs, {
    cwd,
    env: process.env,
    stdio: ["pipe", "pipe", "pipe"],
  })

  child.stdout.setEncoding("utf8")
  child.stderr.setEncoding("utf8")
  child.stdout.on("data", handleCodexStdout)
  child.stderr.on("data", (chunk) => {
    process.stderr.write(chunk)
  })
  child.on("error", (error) => {
    rejectAllPending(error)
  })
  child.on("close", (code, signal) => {
    appServerClosed = true
    rejectAllPending(
      new Error(
        `Codex app-server exited with code ${code ?? "null"} and signal ${
          signal ?? "null"
        }.`
      )
    )
  })

  return child
}

const codex = createCodexProcess()

function rejectAllPending(error) {
  for (const { reject } of pendingRequests.values()) {
    reject(error)
  }
  pendingRequests.clear()
}

function handleCodexMessage(message) {
  void appendJsonLine(codexEventLogPath, message)

  if (message.id !== undefined && pendingRequests.has(message.id)) {
    const pending = pendingRequests.get(message.id)
    pendingRequests.delete(message.id)

    if (message.error) {
      pending.reject(new Error(JSON.stringify(message.error)))
      return
    }

    pending.resolve(message.result)
    return
  }

  if (message.method === "thread/started") {
    threadId = message.params?.thread?.id ?? threadId
  }
}

function handleCodexStdout(chunk) {
  stdoutBuffer += chunk
  const lines = stdoutBuffer.split(/\r?\n/)
  stdoutBuffer = lines.pop() ?? ""

  for (const line of lines) {
    if (!line.trim()) {
      continue
    }

    try {
      handleCodexMessage(JSON.parse(line))
    } catch {
      process.stderr.write(`[codex-app-server] non-json stdout: ${line}\n`)
    }
  }
}

function sendCodexRequest(method, params) {
  if (appServerClosed) {
    return Promise.reject(new Error("Codex app-server is not running."))
  }

  const id = nextRequestId++
  const message = { id, method, params }

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { reject, resolve })
    codex.stdin.write(`${JSON.stringify(message)}\n`, "utf8", (error) => {
      if (!error) {
        return
      }

      pendingRequests.delete(id)
      reject(error)
    })
  })
}

async function initializeCodex() {
  if (initialized) {
    return
  }

  await sendCodexRequest("initialize", {
    capabilities: {
      experimentalApi: true,
      requestAttestation: false,
    },
    clientInfo: {
      name: "agent-html-codex-bridge",
      version: "0.1.0",
    },
  })
  initialized = true
}

async function ensureThread() {
  await initializeCodex()

  if (threadId) {
    return threadId
  }

  const result = await sendCodexRequest("thread/start", {
    cwd,
    experimentalRawEvents: false,
    persistExtendedHistory: false,
    runtimeWorkspaceRoots: [cwd],
  })
  threadId = result?.thread?.id

  if (!threadId) {
    throw new Error("Codex app-server did not return a thread id.")
  }

  return threadId
}

async function startTurn(promptText) {
  const currentThreadId = await ensureThread()
  const result = await sendCodexRequest("turn/start", {
    cwd,
    input: [
      {
        text: promptText,
        text_elements: [],
        type: "text",
      },
    ],
    runtimeWorkspaceRoots: [cwd],
    threadId: currentThreadId,
  })

  return {
    threadId: currentThreadId,
    turnId: result?.turn?.id ?? null,
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {})
    return
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      connected: initialized && !appServerClosed,
      appServerRunning: !appServerClosed,
      ok: true,
      provider: "codex_app_server",
      threadId,
    })
    return
  }

  if (request.method !== "POST" || request.url !== "/agent-html/events") {
    sendJson(response, 404, {
      error: "not_found",
      ok: false,
    })
    return
  }

  try {
    const payload = JSON.parse(await readBody(request))
    const promptText = String(payload.promptText ?? "")
    const eventId = String(payload.event?.eventId ?? "unknown")

    if (!promptText.trim()) {
      sendJson(response, 400, {
        error: "promptText is required",
        ok: false,
      })
      return
    }

    await appendJsonLine(eventLogPath, payload)
    const turn = await startTurn(promptText)

    sendJson(response, 200, {
      delivery: {
        provider: "codex_app_server",
        state: "turn_started",
        threadId: turn.threadId,
        turnId: turn.turnId,
      },
      eventId,
      ok: true,
    })
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "unknown_error",
      ok: false,
    })
  }
})

server.listen(port, host, () => {
  console.log(`Agent-HTML Codex bridge listening on http://${host}:${port}`)
  console.log(`Codex command: ${codexCommand} ${codexArgs.join(" ")}`)
  console.log(`Codex cwd: ${cwd}`)
})

function shutdown() {
  server.close()
  codex.kill()
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
