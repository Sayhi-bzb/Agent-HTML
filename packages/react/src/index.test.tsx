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
    expect(html).toContain(
      'class="mx-auto flex w-full max-w-6xl flex-col gap-4 bg-background text-foreground"'
    )
    expect(html).toContain('data-agent-html-block-id="summary"')
    expect(html).toContain('class="min-w-0 scroll-mt-4"')
    expect(html).toContain("Hello")
  })

  it("merges layout escape hatch classes without dropping metadata", () => {
    const html = renderToStaticMarkup(
      <Artifact className="max-w-4xl" title="Demo">
        <Block className="col-span-2" id="summary" title="Summary">
          <p>Hello</p>
        </Block>
      </Artifact>
    )

    expect(html).toContain('data-agent-html-artifact="true"')
    expect(html).toContain("max-w-6xl")
    expect(html).toContain("max-w-4xl")
    expect(html).toContain('data-agent-html-block-id="summary"')
    expect(html).toContain("scroll-mt-4")
    expect(html).toContain("col-span-2")
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
