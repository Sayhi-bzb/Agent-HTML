import { describe, expect, it } from "vitest"
import rough from "roughjs"

import { roughRuleHorizontalPath } from "../../../../agent-html/artifacts/nyc-taxi-sketchbook/sketch-components"

describe("NYC taxi rough sketch paths", () => {
  it("keeps the reusable rough rule path parseable by roughjs", () => {
    const generator = rough.generator()

    expect(() => generator.path(roughRuleHorizontalPath)).not.toThrow()
  })
})
