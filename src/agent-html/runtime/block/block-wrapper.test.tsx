import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  AgentHtmlBlockRuntimeProvider,
  AgentHtmlBlockWrapper,
} from "@/agent-html/runtime/block"

describe("AgentHtmlBlockWrapper", () => {
  it("renders block metadata and a Notion-like handle", () => {
    const html = renderToStaticMarkup(
      <AgentHtmlBlockRuntimeProvider>
        <AgentHtmlBlockWrapper
          path="/Page/Stack[0]"
          unit={{
            kind: "block",
            motionKey: "Stack:test",
            path: "/Page/Stack[0]",
            role: "flow-block",
            tag: "Stack",
          }}
        >
          <div>Content</div>
        </AgentHtmlBlockWrapper>
      </AgentHtmlBlockRuntimeProvider>
    )

    expect(html).toContain("data-agent-html-block=\"true\"")
    expect(html).toContain("data-agent-html-block-path=\"/Page/Stack[0]\"")
    expect(html).toContain("data-agent-html-block-handle=\"true\"")
    expect(html).toContain("aria-label=\"Block actions\"")
    expect(html).not.toContain("Moving block")
    expect(html).not.toContain("overlayRect")
    expect(html).not.toContain("rect")
  })
})
