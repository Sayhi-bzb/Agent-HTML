import http from "node:http"
import { appendFile } from "node:fs/promises"

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

const host = process.env.AGENT_HTML_BRIDGE_HOST ?? "127.0.0.1"
const configuredPort = Number.parseInt(
  process.env.AGENT_HTML_BRIDGE_PORT ?? "51278",
  10
)
const port =
  Number.isInteger(configuredPort) && configuredPort >= 0 && configuredPort < 65536
    ? configuredPort
    : 51278
const eventLogPath = process.env.AGENT_HTML_EVENT_LOG

let connected = false
let queuedPayloads = []

const mcp = new McpServer({
  name: "agent-html-claude-channel-bridge",
  version: "0.1.0",
}, {
  capabilities: {
    experimental: {
      "claude/channel": {},
    },
  },
})

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

function createChannelParams(payload) {
  const event = payload.event ?? {}
  const source = event.source ?? {}
  const target = event.target ?? {}

  return {
    content: String(payload.promptText ?? ""),
    meta: {
      blockPath: target.blockPath,
      blockTag: target.blockTag,
      documentId: source.documentId,
      eventId: event.eventId,
      projectId: source.projectId,
      sectionId: source.sectionId,
      source: "agent_html",
    },
  }
}

async function sendChannelNotification(payload) {
  await mcp.server.notification({
    method: "notifications/claude/channel",
    params: createChannelParams(payload),
  })
}

async function appendEventLog(payload) {
  if (!eventLogPath) {
    return
  }

  await appendFile(eventLogPath, `${JSON.stringify(payload)}\n`, "utf8")
}

async function flushQueue() {
  if (!connected || queuedPayloads.length === 0) {
    return
  }

  const payloads = queuedPayloads
  queuedPayloads = []

  for (const payload of payloads) {
    await sendChannelNotification(payload)
  }
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {})
    return
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      connected,
      ok: true,
      provider: "claude_code_channel",
      queued: queuedPayloads.length,
    })
    return
  }

  if (request.method !== "POST" || request.url !== "/agent-html/events") {
    sendJson(response, 404, {
      ok: false,
      error: "not_found",
    })
    return
  }

  try {
    const payload = JSON.parse(await readBody(request))
    const eventId = String(payload.event?.eventId ?? "unknown")

    await appendEventLog(payload)

    if (!connected) {
      queuedPayloads.push(payload)
      sendJson(response, 202, {
        ok: true,
        delivery: {
          provider: "claude_code_channel",
          state: "queued",
        },
        eventId,
      })
      return
    }

    await sendChannelNotification(payload)
    sendJson(response, 200, {
      ok: true,
      delivery: {
        provider: "claude_code_channel",
        state: "sent",
      },
      eventId,
    })
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    })
  }
})

mcp.server.oninitialized = () => {
  connected = true
  flushQueue().catch((error) => {
    console.error(error)
  })
}

server.listen(port, host, () => {
  console.error(
    `Agent-HTML Claude channel bridge listening on http://${host}:${port}`
  )
})

await mcp.connect(new StdioServerTransport())
