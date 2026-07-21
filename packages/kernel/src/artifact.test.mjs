import { describe, expect, it } from "vitest"

import { normalizeArtifactDefinition, titleizeBlockId } from "./artifact.mjs"

describe("Canvas artifact metadata", () => {
  it("normalizes string and object block definitions", () => {
    expect(
      normalizeArtifactDefinition({
        title: "Demo",
        blocks: ["airport-rides", { id: "summary", title: "Overview" }]
      })
    ).toEqual({
      title: "Demo",
      blocks: [
        { id: "airport-rides", title: "Airport Rides" },
        { id: "summary", title: "Overview" }
      ]
    })
    expect(titleizeBlockId("route-map")).toBe("Route Map")
  })
})
