import { describe, expect, it } from "vitest"

import {
  collectArtifactDefinition,
  collectBlockIds,
  collectStaticBlockMetadata,
  titleizeBlockId,
} from "./block-tags.mjs"

describe("React Canvas artifact definition parser", () => {
  it("collects static block ids from defineArtifact entries", () => {
    const blocks = collectBlockIds(`
      import { defineArtifact } from "@agent-html/react"

      export default defineArtifact({
        title: "Demo",
        blocks: [
          "summary",
          { id: "deep-dive", title: "Deep Dive" },
        ],
      })
    `)

    expect(blocks).toEqual([
      {
        id: "summary",
        index: expect.any(Number),
        title: null,
      },
      {
        id: "deep-dive",
        index: expect.any(Number),
        title: "Deep Dive",
      },
    ])
  })

  it("collects artifact title and host metadata", () => {
    const source = `
      export default defineArtifact({
        title: "Demo",
        blocks: [
          "summary",
          { id: "custom-title", title: "Custom Title" },
        ],
      })
    `

    expect(collectArtifactDefinition(source).title).toBe("Demo")
    expect(collectStaticBlockMetadata(source)).toEqual([
      { id: "summary", title: "Summary" },
      { id: "custom-title", title: "Custom Title" },
    ])
  })

  it("titleizes kebab-case block ids", () => {
    expect(titleizeBlockId("airport-rides")).toBe("Airport Rides")
  })

  it("returns empty metadata when defineArtifact is absent", () => {
    expect(collectStaticBlockMetadata("export default function Demo() {}")).toEqual([])
  })
})
