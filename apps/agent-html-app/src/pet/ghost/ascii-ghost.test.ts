import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const asciiGhostPath = fileURLToPath(
  new URL("./ascii-ghost.tsx", import.meta.url)
)
const asciiGhostSource = readFileSync(asciiGhostPath, "utf8")

describe("AsciiGhost eye animation", () => {
  it("uses the expressive eye-only blink sequence", () => {
    expect(asciiGhostSource).toContain(
      '["█", "▇", "▅", "▂", "▁", "▁", "▃", "▆", "█"]'
    )
    expect(asciiGhostSource).toContain("GHOST_BLINK_FPS = 30")
  })

  it("keeps the ghost grid fixed around independent eye slots", () => {
    expect(asciiGhostSource).toContain('"╭──────╮"')
    expect(asciiGhostSource).toContain('"│      │"')
    expect(asciiGhostSource).toContain('"│╭╮╭╮╭╮│"')
    expect(asciiGhostSource).toContain("<span ref={leftEyeRef}>█</span>")
    expect(asciiGhostSource).toContain("<span ref={rightEyeRef}>█</span>")
  })

  it("does not add character motion animation", () => {
    expect(asciiGhostSource).not.toContain("translateY")
    expect(asciiGhostSource).not.toContain("scale")
    expect(asciiGhostSource).not.toContain("bounce")
    expect(asciiGhostSource).not.toContain("float")
  })
})
