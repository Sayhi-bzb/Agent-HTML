import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const sourceRoot = path.resolve(import.meta.dirname)
const productSources = fs
  .readdirSync(sourceRoot)
  .filter(
    (file) =>
      /\.(css|tsx?)$/.test(file) && !file.endsWith(".test.ts")
  )
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

  it("keeps structural values in owned tokens and borders behavior-only", () => {
    const css = fs.readFileSync(path.join(sourceRoot, "styles.css"), "utf8")
    const borders = [...css.matchAll(/^\s*border:\s*([^;]+);/gm)].map(
      (match) => match[1]
    )
    const radii = [...css.matchAll(/^\s*border-radius:\s*([^;]+);/gm)].map(
      (match) => match[1]
    )

    expect(borders.every((value) => value === "0")).toBe(true)
    expect(
      radii.every(
        (value) => value === "50%" || value === "var(--canvas-desktop-radius)"
      )
    ).toBe(true)
    const shadows = [...css.matchAll(/^\s*box-shadow:\s*([^;]+);/gm)].map(
      (match) => match[1]
    )
    expect(shadows).toEqual(["var(--canvas-desktop-overlay-shadow)"])
  })
})
