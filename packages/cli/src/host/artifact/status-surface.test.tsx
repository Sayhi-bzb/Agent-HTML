import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HostStatusMessage } from "./status-surface"

describe("HostStatusMessage", () => {
  it("keeps technical diagnostics collapsed behind a readable summary", () => {
    const markup = renderToStaticMarkup(
      <HostStatusMessage
        context="The previous Artifact remains visible below."
        details="Bundle load failed for C:/runtime/hash/module.js"
        detailsLabel="Technical details"
        message="The selected Artifact could not load."
        title="Artifact unavailable"
      />
    )

    expect(markup).toContain('data-slot="alert"')
    expect(markup).toContain("The selected Artifact could not load.")
    expect(markup).toContain("The previous Artifact remains visible below.")
    expect(markup).toContain('data-slot="collapsible"')
    expect(markup).toContain('data-state="closed"')
    expect(markup).toContain('aria-expanded="false"')
    expect(markup).toContain("Technical details")
    expect(markup).not.toContain("Bundle load failed for C:/runtime/hash/module.js")
  })

  it("renders simple status messages without an empty details control", () => {
    const markup = renderToStaticMarkup(
      <HostStatusMessage message="No Artifacts found." title="Empty" />
    )

    expect(markup).toContain("No Artifacts found.")
    expect(markup).not.toContain('data-slot="collapsible"')
  })
})
