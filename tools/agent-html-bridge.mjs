import http from "node:http"
import { appendFile } from "node:fs/promises"

const host = process.env.AGENT_HTML_BRIDGE_HOST ?? "127.0.0.1"
const configuredPort = Number.parseInt(
  process.env.AGENT_HTML_BRIDGE_PORT ?? "51278",
  10
)
const port =
  Number.isInteger(configuredPort) && configuredPort >= 0 && configuredPort < 65536
    ? configuredPort
    : 51278
const forwardUrl = process.env.AGENT_HTML_FORWARD_URL
const eventLogPath = process.env.AGENT_HTML_EVENT_LOG

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

async function forwardEvent(payload) {
  if (!forwardUrl) {
    return { provider: "stdout", state: "accepted" }
  }

  const response = await fetch(forwardUrl, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })

  if (!response.ok) {
    throw new Error(`Forward target returned ${response.status}`)
  }

  return { provider: "forward_url", state: "forwarded" }
}

async function appendEventLog(payload) {
  if (!eventLogPath) {
    return
  }

  await appendFile(eventLogPath, `${JSON.stringify(payload)}\n`, "utf8")
}

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 204, {})
    return
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      provider: forwardUrl ? "forward_url" : "stdout",
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
    const body = await readBody(request)
    const payload = JSON.parse(body)
    const promptText = String(payload.promptText ?? "")
    const eventId = String(payload.event?.eventId ?? "unknown")

    console.log(`\n[agent-html] received event ${eventId}`)
    console.log(promptText)
    await appendEventLog(payload)

    const delivery = await forwardEvent(payload)
    sendJson(response, 200, {
      ok: true,
      eventId,
      delivery,
    })
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "unknown_error",
    })
  }
})

server.listen(port, host, () => {
  console.log(`Agent-HTML bridge listening on http://${host}:${port}`)
  if (forwardUrl) {
    console.log(`Forwarding events to ${forwardUrl}`)
  } else {
    console.log("No AGENT_HTML_FORWARD_URL set; events will be printed only.")
  }
})
