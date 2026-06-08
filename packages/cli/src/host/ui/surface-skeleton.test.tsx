import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HostSurfaceSkeleton } from "./surface-skeleton"

describe("HostSurfaceSkeleton", () => {
  it("renders block-aware skeleton metadata", () => {
    const markup = renderToStaticMarkup(
      <HostSurfaceSkeleton
        blocks={[
          { id: "summary", title: "Summary" },
          { id: "details", title: "details" },
        ]}
      />
    )

    expect(markup).toContain('data-agent-html-artifact-skeleton="true"')
    expect(markup).toContain(
      'data-agent-html-artifact-skeleton-block-id="summary"'
    )
    expect(markup).toContain(
      'data-agent-html-artifact-skeleton-block-title="Summary"'
    )
    expect(markup).toContain(
      'data-agent-html-artifact-skeleton-block-id="details"'
    )
  })

  it("caps rendered block skeletons", () => {
    const markup = renderToStaticMarkup(
      <HostSurfaceSkeleton
        blocks={Array.from({ length: 8 }, (_, index) => ({
          id: `block-${index}`,
          title: `Block ${index}`,
        }))}
      />
    )

    expect(markup.match(/data-agent-html-artifact-skeleton-block-id=/g)).toHaveLength(
      6
    )
    expect(markup).toContain("canvas-artifact-skeleton-block-overflow")
  })
})
