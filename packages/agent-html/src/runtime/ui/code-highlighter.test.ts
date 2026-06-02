import { describe, expect, it } from "vitest"

import {
  canHighlightCode,
  highlightCode,
} from "@/agent-html/runtime/ui/code-highlighter"

describe("code-highlighter", () => {
  it("highlights supported schema languages", async () => {
    await expect(highlightCode("const ok = true", "tsx")).resolves.toMatchObject(
      {
        html: expect.stringContaining("<pre"),
        darkHtml: expect.stringContaining("<pre"),
      }
    )
  })

  it("maps agent html and react source aliases", async () => {
    expect(canHighlightCode("ahtml")).toBe(true)
    expect(canHighlightCode("react")).toBe(true)

    await expect(highlightCode("<Cell />", "ahtml")).resolves.toMatchObject({
      html: expect.stringContaining("Cell"),
      darkHtml: expect.stringContaining("Cell"),
    })
  })

  it("returns null for unsupported languages", async () => {
    expect(canHighlightCode("python")).toBe(false)
    await expect(highlightCode("print('nope')", "python")).resolves.toBeNull()
  })
})
