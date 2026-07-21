import { describe, expect, it } from "vitest"

import {
  CANVAS_LAYOUT_VERSION,
  createEmptyCanvasLayout,
  normalizeCanvasLayout,
} from "./index.mjs"

describe("Canvas layout contract", () => {
  it("creates and normalizes versioned geometry", () => {
    expect(createEmptyCanvasLayout()).toEqual({ nodes: {}, version: 1 })
    expect(
      normalizeCanvasLayout({
        nodes: {
          profile: { height: 180, width: 320, x: -20, y: 40 },
        },
        version: CANVAS_LAYOUT_VERSION,
      })
    ).toEqual({
      nodes: {
        profile: { height: 180, width: 320, x: -20, y: 40 },
      },
      version: 1,
    })
  })

  it("rejects invalid versions and geometry", () => {
    expect(() => normalizeCanvasLayout({ nodes: {}, version: 2 })).toThrow(
      "version"
    )
    expect(() =>
      normalizeCanvasLayout({
        nodes: { profile: { height: 0, width: 320, x: 0, y: 0 } },
        version: 1,
      })
    ).toThrow("positive")
  })
})
