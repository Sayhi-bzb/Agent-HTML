import { describe, expect, it } from "vitest"

import { readySession, workspaceError } from "./session"

describe("desktop session contract", () => {
  it("accepts the matching runtime protocol", () => {
    expect(
      readySession({
        bootstrapUrl: "http://127.0.0.1/session",
        protocolVersion: 1,
        root: "/project",
        runtimeUrl: "http://127.0.0.1",
      }).status
    ).toBe("ready")
  })

  it("turns compatibility and startup failures into explicit recovery states", () => {
    expect(
      readySession({
        bootstrapUrl: "http://127.0.0.1/session",
        protocolVersion: 2,
        root: "/project",
        runtimeUrl: "http://127.0.0.1",
      })
    ).toMatchObject({
      status: "failed",
      error: { code: "incompatible-runtime", recoverable: false },
    })
    expect(workspaceError(new Error("agent-html/ is missing"))).toMatchObject({
      code: "missing-workspace",
      recoverable: true,
    })
    expect(workspaceError(new Error("Selected folder is inaccessible"))).toMatchObject({
      code: "inaccessible",
      recoverable: true,
    })
    expect(
      workspaceError(new Error("Runtime protocol is incompatible"))
    ).toMatchObject({
      code: "incompatible-runtime",
      recoverable: false,
    })
  })
})
