import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const source = fs.readFileSync(
  path.resolve(import.meta.dirname, "agent-menu.tsx"),
  "utf8"
)

describe("standalone Agent menu", () => {
  it("matches the Desktop utility menu hierarchy", () => {
    for (const label of [
      "Search",
      "New thread",
      "Appearance",
      "Preset",
      "Theme",
      "Language",
      "Documentation",
      "GitHub",
    ]) {
      expect(source).toContain(label)
    }
    expect(source.indexOf('label="Search"')).toBeLessThan(
      source.indexOf('activeThreadLabel ?? "New thread"')
    )
    expect(source.indexOf('activeThreadLabel ?? "New thread"')).toBeLessThan(
      source.indexOf('label="Appearance"')
    )
    expect(source.indexOf('label="Appearance"')).toBeLessThan(
      source.indexOf('label="Preset"')
    )
    expect(source.indexOf('label="Preset"')).toBeLessThan(
      source.indexOf('label="Theme"')
    )
    expect(source).toContain("activeThemePreset?.label ?? activeThemePresetId")
    expect(source).not.toContain("Customize…")
  })

  it("does not depend on the removed Sidebar", () => {
    expect(source).not.toContain("components/ui/sidebar")
    expect(source).not.toContain("Sidebar")
  })
})
