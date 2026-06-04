import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { Action, Artifact, Block } from "./index"

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
    expect(html).not.toContain("mx-auto")
    expect(html).not.toContain("max-w-6xl")
    expect(html).not.toContain("bg-background")
    expect(html).not.toContain("text-foreground")
    expect(html).toContain('data-agent-html-block-id="summary"')
    expect(html).not.toContain("min-w-0")
    expect(html).not.toContain("scroll-mt-4")
    expect(html).toContain("Hello")
  })

  it("keeps Block protocol-only while Artifact can own page layout", () => {
    const html = renderToStaticMarkup(
      <Artifact className="max-w-4xl" title="Demo">
        <Block id="summary" title="Summary">
          <div className="col-span-2">
            <p>Hello</p>
          </div>
        </Block>
      </Artifact>
    )

    expect(html).toContain('data-agent-html-artifact="true"')
    expect(html).toContain("max-w-4xl")
    expect(html).not.toContain("max-w-6xl")
    expect(html).toContain('data-agent-html-block-id="summary"')
    expect(html).not.toContain("scroll-mt-4")
    expect(html).toContain("col-span-2")
  })

  it("does not type-check visual props on Block", () => {
    // @ts-expect-error Block is a protocol marker, not a layout surface.
    const element = <Block className="col-span-2" id="summary" />

    expect(element.type).toBe(Block)
  })

  it("dispatches action intent for the host", () => {
    const events: Array<{ detail: unknown; type: string }> = []
    const previousWindow = globalThis.window
    globalThis.window = {
      dispatchEvent(event: Event) {
        events.push({
          detail: (event as CustomEvent).detail,
          type: event.type,
        })
        return true
      },
    } as Window & typeof globalThis

    try {
      const element = Action({
        prompt: "Update this block",
        target: "summary",
      })

      element.props.onClick()
    } finally {
      globalThis.window = previousWindow
    }

    expect(events).toEqual([
      {
        detail: {
          prompt: "Update this block",
          target: "summary",
        },
        type: "agent-html:action",
      },
    ])
  })
})
