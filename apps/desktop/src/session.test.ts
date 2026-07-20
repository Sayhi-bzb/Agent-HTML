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
    expect(
      workspaceError({
        code: "missing-workspace",
        phase: "workspace-selection",
        message: "agent-html/ is missing",
        recoverable: true,
      })
    ).toMatchObject({ code: "missing-workspace" })
    expect(
      workspaceError({
        code: "inaccessible",
        phase: "workspace-selection",
        message: "Selected folder is inaccessible",
        recoverable: true,
      })
    ).toMatchObject({ code: "inaccessible" })
    expect(
      workspaceError({
        code: "incompatible-runtime",
        phase: "runtime-readiness",
        message: "Runtime protocol is incompatible",
        recoverable: false,
      })
    ).toMatchObject({
      code: "incompatible-runtime",
      recoverable: false,
    })
  })

  it("uses an internal fallback without guessing from error text", () => {
    expect(workspaceError(new Error("agent-html/ is missing"))).toMatchObject({
      code: "internal",
      phase: "runtime-start",
      recoverable: true,
    })
  })
})
