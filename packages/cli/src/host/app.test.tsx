import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const appPath = fileURLToPath(new URL("./app.tsx", import.meta.url))
const appSource = readFileSync(appPath, "utf8")

describe("ReactCanvasHostApp prompt status copy", () => {
  it("only keeps error-oriented prompt status copy", () => {
    expect(appSource).not.toContain("Sending to Codex")
    expect(appSource).not.toContain("Sending to example pipeline")
    expect(appSource).not.toContain("Sent to Codex thread")
    expect(appSource).not.toContain("Started a new Codex thread")
    expect(appSource).not.toContain("Sent to example pipeline")
    expect(appSource).toContain('setPromptStatus("No active artifact.")')
    expect(appSource).toContain("setPromptStatus(errorMessage)")
  })
})
