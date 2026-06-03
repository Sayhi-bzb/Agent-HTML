import { describe, expect, it } from "vitest"

import { extractBlockSource } from "./source.mjs"

describe("React Canvas source helpers", () => {
  it("extracts a selected Block source slice", () => {
    const source = `
      <Artifact title="Demo">
        <Block id="summary" title="Summary">
          <p>Summary</p>
        </Block>
        <Block id="next-steps">Next</Block>
      </Artifact>
    `

    expect(extractBlockSource(source, "summary")).toContain('<Block id="summary" title="Summary">')
    expect(extractBlockSource(source, "summary")).toContain("</Block>")
  })

  it("returns null for a missing Block", () => {
    expect(extractBlockSource("<Block id=\"summary\">Summary</Block>", "missing")).toBeNull()
  })
})
