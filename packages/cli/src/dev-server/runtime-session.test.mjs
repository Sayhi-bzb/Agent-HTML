import { describe, expect, it } from "vitest"

import {
  createRuntimeSession,
  runtimeSessionCookieName,
  validateRuntimeToken,
} from "./runtime-session.mjs"

function createResponse() {
  return {
    body: "",
    headers: {},
    statusCode: 0,
    end(body = "") {
      this.body = body
    },
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode
      this.headers = headers
    },
  }
}

const token = "runtime-token-with-at-least-thirty-two-characters"

describe("runtime session", () => {
  it("requires a strong per-launch token", () => {
    expect(() => validateRuntimeToken("short")).toThrow(
      "at least 32 characters"
    )
    expect(validateRuntimeToken(token)).toBe(token)
  })

  it("exchanges the bootstrap token for an HttpOnly session cookie", () => {
    const session = createRuntimeSession({ token })
    const response = createResponse()

    expect(
      session.authorize({
        request: {
          method: "GET",
          url: `/__agent-html/runtime/session?token=${token}`,
        },
        response,
      })
    ).toBe(false)
    expect(response.statusCode).toBe(303)
    expect(response.headers.Location).toBe("/")
    expect(response.headers["Referrer-Policy"]).toBe("no-referrer")
    expect(response.headers["Set-Cookie"]).toContain(
      `${runtimeSessionCookieName}=`
    )
    expect(response.headers["Set-Cookie"]).toContain("HttpOnly")
    expect(response.headers["Set-Cookie"]).toContain("SameSite=Strict")
  })

  it("accepts bearer or cookie credentials and rejects other requests", () => {
    const session = createRuntimeSession({ token })
    const bearerResponse = createResponse()
    const cookieResponse = createResponse()
    const rejectedResponse = createResponse()

    expect(
      session.authorize({
        request: {
          headers: { authorization: `Bearer ${token}` },
          url: "/__agent-html/runtime/health",
        },
        response: bearerResponse,
      })
    ).toBe(true)
    expect(
      session.authorize({
        request: {
          headers: { cookie: `${runtimeSessionCookieName}=${token}` },
          url: "/",
        },
        response: cookieResponse,
      })
    ).toBe(true)
    expect(
      session.authorize({
        request: { headers: {}, url: "/" },
        response: rejectedResponse,
      })
    ).toBe(false)
    expect(rejectedResponse.statusCode).toBe(401)
    expect(rejectedResponse.headers["Cache-Control"]).toBe("no-store")
  })
})
