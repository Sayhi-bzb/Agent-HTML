import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const runtimeViewportPath = fileURLToPath(
  new URL("./runtime-viewport.tsx", import.meta.url)
)
const runtimeViewportSource = readFileSync(runtimeViewportPath, "utf8")

describe("AgentHtmlRuntimeViewport", () => {
  it("does not make the whole artifact viewport text-selectable", () => {
    expect(runtimeViewportSource).toContain('data-selection="none"')
    expect(runtimeViewportSource).not.toContain('data-selection="text"')
  })
})
