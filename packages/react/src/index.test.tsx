import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  Artifact,
  Block,
  artifactInteractionEventName,
  createArtifactStateChange,
  dispatchArtifactStateChange,
} from "./index"

describe("@agent-html/react", () => {
  it("renders normal React children with host metadata", () => {
    const html = renderToStaticMarkup(
      <Artifact title="Demo">
        <Block id="summary" title="Summary">
          <p>Hello</p>
        </Block>
      </Artifact>
    )

    expect(html).toContain('data-agent-html-artifact="true"')
    expect(html).toContain('data-agent-html-title="Demo"')
    expect(html).toContain("agent-html-artifact")
    expect(html).not.toContain("max-w-2xl")
    expect(html).not.toContain("gap-8")
    expect(html).toContain('id="summary"')
    expect(html).toContain('data-agent-html-block-id="summary"')
    expect(html).not.toContain("min-w-0")
    expect(html).not.toContain("scroll-mt-4")
    expect(html).toContain("Hello")
  })

  it("keeps Artifact as a token-configured reading container", () => {
    const html = renderToStaticMarkup(
      <Artifact title="Demo">
        <Block id="summary" title="Summary">
          <div className="col-span-2">
            <p>Hello</p>
          </div>
        </Block>
      </Artifact>
    )

    expect(html).toContain('data-agent-html-artifact="true"')
    expect(html).toContain("agent-html-artifact")
    expect(html).not.toContain("max-w-4xl")
    expect(html).toContain('data-agent-html-block-id="summary"')
    expect(html).not.toContain("scroll-mt-4")
    expect(html).toContain("col-span-2")
  })

  it("does not type-check visual props on Artifact", () => {
    // @ts-expect-error Artifact owns token-configured reading layout.
    const element = <Artifact className="max-w-4xl" title="Demo" />

    expect(element.type).toBe(Artifact)
  })

  it("does not type-check visual props on Block", () => {
    // @ts-expect-error Block is a protocol marker, not a layout surface.
    const element = <Block className="col-span-2" id="summary" />

    expect(element.type).toBe(Block)
  })

  it("normalizes interaction changes with timestamps", () => {
    expect(
      createArtifactStateChange({
        after: true,
        before: false,
        blockId: "settings",
        component: "checkbox",
        controlId: "enable-motion",
        kind: "toggle",
        timestamp: 123,
      })
    ).toEqual({
      after: true,
      before: false,
      blockId: "settings",
      component: "checkbox",
      controlId: "enable-motion",
      kind: "toggle",
      timestamp: 123,
    })
  })

  it("keeps interaction dispatch portable without a browser window", () => {
    const change = dispatchArtifactStateChange({
      after: "doing",
      before: "todo",
      blockId: "roadmap",
      component: "select",
      controlId: "status",
      kind: "select",
      timestamp: 456,
    })

    expect(change).toEqual({
      after: "doing",
      before: "todo",
      blockId: "roadmap",
      component: "select",
      controlId: "status",
      kind: "select",
      timestamp: 456,
    })
    expect(artifactInteractionEventName).toBe("agent-html:state-change")
  })
})
