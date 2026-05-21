import { describe, expect, it } from "vitest"

import type { SessionSummary } from "@/lib/types"

import {
  createInitialMockSessionSources,
  createMockBuildSummary,
  createMockPreviewHtml,
  createMockRuntimeReport,
  createMockSessionDetail,
  createMockSessionSummary,
  createMockValidationSnapshot,
} from "./mock-runtime"

function createSummary(overrides?: Partial<SessionSummary>): SessionSummary {
  return {
    id: "session-custom-review",
    name: "Custom Review",
    directory: "D:/Users/demo/.agent-html-app/sessions/custom-review",
    status: "dirty",
    updatedAt: "2026-05-21T10:00:00.000Z",
    hasPreview: true,
    ...overrides,
  }
}

describe("mock-runtime", () => {
  it("creates predictable mock session ids and defaults", () => {
    const summary = createMockSessionSummary("Review Notes", 3)

    expect(summary.id).toBe("session-review-notes-3")
    expect(summary.status).toBe("draft")
    expect(summary.hasPreview).toBe(false)
  })

  it("generates preview html from session source", () => {
    const summary = createSummary()
    const source = `<page title="Custom Review">
  <alert title="Recommendation" tone="neutral">
    Keep the rollout staged.
  </alert>
  <card title="Notes">
    <list variant="unordered">
      <item>Watch reconnect latency.</item>
      <item>Verify buffering behavior.</item>
    </list>
  </card>
</page>`

    const html = createMockPreviewHtml(summary, source)

    expect(html).toContain("<title>Custom Review</title>")
    expect(html).toContain("Keep the rollout staged.")
    expect(html).toContain("Watch reconnect latency.")
  })

  it("marks invalid sources that are missing a page root", () => {
    const result = createMockValidationSnapshot(
      createSummary(),
      "<alert>Broken source</alert>",
    )

    expect(result.status).toBe("invalid")
    expect(result.diagnostics.some((item) => item.severity === "error")).toBe(true)
  })

  it("creates runtime report counts for mock mode", () => {
    const report = createMockRuntimeReport()

    expect(report.status).toBe("ok")
    expect(report.counts.ok).toBe(4)
    expect(report.counts.skip).toBe(1)
    expect(report.checks.some((item) => item.name === "session-store")).toBe(true)
  })

  it("keeps the last successful mock build summary even when inspect marks the session error", () => {
    const summary = createSummary({
      status: "error",
      hasPreview: true,
      lastBuildAt: "2026-05-21T09:55:00.000Z",
    })
    const session = createMockSessionDetail(
      summary,
      '<page title="Custom Review"></page>',
      "inspect",
    )

    const build = createMockBuildSummary(summary, session)

    expect(build.status).toBe("succeeded")
    expect(build.exitCode).toBe(0)
    expect(build.previewPath).toBe(session.previewPath)
  })

  it("creates initial sources for each provided session", () => {
    const sessions = [
      createSummary({ id: "session-a", name: "Session A" }),
      createSummary({ id: "session-b", name: "Session B" }),
    ]

    const sources = createInitialMockSessionSources(sessions)

    expect(Object.keys(sources)).toEqual(["session-a", "session-b"])
    expect(sources["session-a"]).toContain('<page title="Session A">')
    expect(sources["session-b"]).toContain('<page title="Session B">')
  })
})
