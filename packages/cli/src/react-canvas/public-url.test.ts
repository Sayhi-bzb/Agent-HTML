import { describe, expect, it } from "vitest"

import {
  artifactPublicUrl,
  artifactPublicUrlFactory,
  sharedPublicUrl,
} from "@/lib/public-url"

describe("public URL helpers", () => {
  it("builds artifact public asset URLs", () => {
    expect(artifactPublicUrl("nasa-artemis-ii", "launch-sls.jpg")).toBe(
      "/__agent-html/artifacts/nasa-artemis-ii/public/launch-sls.jpg"
    )
  })

  it("normalizes leading slashes", () => {
    expect(artifactPublicUrl("tokyo-three-speeds", "/header.jpg")).toBe(
      "/__agent-html/artifacts/tokyo-three-speeds/public/header.jpg"
    )
    expect(sharedPublicUrl("/ghost.svg")).toBe("/__agent-html/public/ghost.svg")
  })

  it("keeps nested paths, query strings, and fragments", () => {
    expect(
      artifactPublicUrl(
        "health-report-decoder",
        "healthicons/heart.svg?v=1#symbol"
      )
    ).toBe(
      "/__agent-html/artifacts/health-report-decoder/public/healthicons/heart.svg?v=1#symbol"
    )
  })

  it("creates artifact-local URL factories", () => {
    const publicUrl = artifactPublicUrlFactory("nyc-taxi-sketchbook")

    expect(publicUrl("trip-ledger.svg")).toBe(
      "/__agent-html/artifacts/nyc-taxi-sketchbook/public/trip-ledger.svg"
    )
  })
})
