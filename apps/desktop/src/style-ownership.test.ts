import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const sourceRoot = path.resolve(import.meta.dirname)
const productSources = fs
  .readdirSync(sourceRoot)
  .filter((file) => /\.(css|tsx?)$/.test(file) && !file.endsWith(".test.ts"))
  .map((file) => ({
    content: fs.readFileSync(path.join(sourceRoot, file), "utf8"),
    file,
  }))

describe("desktop visual ownership", () => {
  it("keeps raw palette utilities and literal legacy colors out of composition", () => {
    for (const { content, file } of productSources) {
      expect(content, file).not.toMatch(
        /\b(?:bg|text|border|shadow)-(?:red|blue|green|gray|slate|zinc|neutral|stone|amber|orange|purple|pink)-\d+\b/
      )
      expect(content, file).not.toMatch(/#[\da-f]{3,8}\b|\brgba?\(|\bhsla?\(/i)
      expect(content, file).not.toContain("color-mix(")
    }
  })

  it("keeps structural values in owned tokens and borders limited to menus", () => {
    const css = fs.readFileSync(path.join(sourceRoot, "styles.css"), "utf8")
    const borders = [...css.matchAll(/^\s*border:\s*([^;]+);/gm)].map(
      (match) => match[1]
    )
    const radii = [...css.matchAll(/^\s*border-radius:\s*([^;]+);/gm)].map(
      (match) => match[1]
    )

    expect(borders.filter((value) => value !== "0")).toEqual([
      "1px solid var(--input)",
    ])
    expect(
      radii.every(
        (value) => value === "50%" || value === "var(--canvas-desktop-radius)"
      )
    ).toBe(true)
    const shadows = [...css.matchAll(/^\s*box-shadow:\s*([^;]+);/gm)].map(
      (match) => match[1]
    )
    expect(shadows).toEqual([])
  })

  it("consumes Canvas foundation without redefining semantic theme tokens", () => {
    const css = fs.readFileSync(path.join(sourceRoot, "styles.css"), "utf8")
    const semanticTokenDefinitions = [
      "accent",
      "accent-foreground",
      "background",
      "destructive",
      "foreground",
      "muted-foreground",
      "primary",
      "primary-foreground",
      "ring",
    ]

    expect(css).toContain('@import "../../../agent-html/styles/foundation.css"')
    expect(css).toContain(
      '@import "../../../packages/cli/src/shared/brand.css"'
    )
    expect(css).toContain("--canvas-desktop-radius: var(--radius)")
    expect(css).toContain(
      "--canvas-desktop-titlebar-navigation-font-size: var(--font-size-xs)"
    )
    expect(css).toContain("background: var(--primary)")
    expect(css).toContain("color: var(--primary-foreground)")
    expect(css).toMatch(
      /\.desktop-titlebar__control\[data-kind="close"\]:hover\s*\{[^}]*background: var\(--destructive\)[^}]*color: var\(--destructive-foreground\)/s
    )
    expect(css).not.toContain("packages/cli/src/host/styles")
    expect(css).not.toContain("desktop-dialog")
    expect(css).not.toContain("--canvas-desktop-scrim")
    expect(css).not.toContain("--canvas-desktop-overlay-shadow")
    expect(css).toContain("font-size: clamp(2rem, 5vw, 3rem)")
    expect(css).toContain("line-height: 1")
    expect(css).toContain("height: 0.9em")
    expect(css).toContain("gap: var(--agent-html-brand-gap)")
    expect(css).not.toMatch(/--canvas-desktop-titlebar-brand-[\w-]+\s*:/)
    expect(css).not.toContain("--canvas-desktop-titlebar-title-font-size")
    expect(css).not.toContain("var(--agent-html-brand-icon-size)")

    for (const token of semanticTokenDefinitions) {
      expect(css).not.toMatch(new RegExp(`^\\s*--${token}\\s*:`, "m"))
    }
  })
})
