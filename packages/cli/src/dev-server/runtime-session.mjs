import crypto from "node:crypto"

import { sendError } from "./http.mjs"

export const runtimeProtocolVersion = 1
export const runtimeSessionRoute = "/__agent-html/runtime/session"
export const runtimeSessionCookieName = "agent_html_runtime_session"

function secureEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") {
    return false
  }

  const leftBytes = Buffer.from(left)
  const rightBytes = Buffer.from(right)

  return (
    leftBytes.length === rightBytes.length &&
    crypto.timingSafeEqual(leftBytes, rightBytes)
  )
}

function readBearerToken(request) {
  const authorization = request.headers?.authorization
  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return null
  }

  return authorization.slice("Bearer ".length)
}

function readCookieToken(request) {
  const cookie = request.headers?.cookie
  if (typeof cookie !== "string") {
    return null
  }

  for (const part of cookie.split(";")) {
    const [name, ...valueParts] = part.trim().split("=")
    if (name === runtimeSessionCookieName) {
      return decodeURIComponent(valueParts.join("="))
    }
  }

  return null
}

function rejectUnauthorized(response) {
  response.writeHead(401, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "WWW-Authenticate": 'Bearer realm="agent-html-runtime"',
  })
  response.end(JSON.stringify({ error: "Runtime authentication required" }))
}

export function validateRuntimeToken(token) {
  if (typeof token !== "string" || token.length < 32) {
    throw new Error("Runtime token must contain at least 32 characters")
  }

  return token
}

export function createRuntimeSession({ token }) {
  const expectedToken = token ? validateRuntimeToken(token) : null

  return {
    authenticated: Boolean(expectedToken),

    bootstrapUrl(baseUrl) {
      if (!expectedToken) {
        return baseUrl
      }

      const url = new URL(runtimeSessionRoute, baseUrl)
      url.searchParams.set("token", expectedToken)
      return url.toString()
    },

    authorize({ request, response }) {
      if (!expectedToken) {
        return true
      }

      const requestUrl = new URL(request.url ?? "/", "http://localhost")
      if (requestUrl.pathname === runtimeSessionRoute) {
        if (
          request.method !== "GET" ||
          !secureEqual(requestUrl.searchParams.get("token"), expectedToken)
        ) {
          rejectUnauthorized(response)
          return false
        }

        response.writeHead(303, {
          "Cache-Control": "no-store",
          Location: "/",
          "Referrer-Policy": "no-referrer",
          "Set-Cookie": `${runtimeSessionCookieName}=${encodeURIComponent(
            expectedToken
          )}; HttpOnly; SameSite=Strict; Path=/`,
        })
        response.end()
        return false
      }

      const providedToken = readBearerToken(request) ?? readCookieToken(request)
      if (!secureEqual(providedToken, expectedToken)) {
        rejectUnauthorized(response)
        return false
      }

      return true
    },
  }
}

export function requireRuntimeShutdown(runtimeControl, response) {
  if (!runtimeControl?.allowShutdown) {
    sendError(response, "Runtime shutdown is not available", 403)
    return false
  }

  return true
}
