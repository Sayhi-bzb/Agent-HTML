export function sendJson(response, value) {
  response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" })
  response.end(JSON.stringify(value))
}

export function sendText(response, content, contentType) {
  response.writeHead(200, { "Content-Type": contentType })
  response.end(content)
}

export function sendNotFound(response) {
  sendError(response, "Not found", 404)
}

export function sendError(response, error, statusCode = 500) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  })
  response.end(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    })
  )
}
