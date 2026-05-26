import * as React from "react"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import {
  AgentHtmlBlockRuntimeProvider,
  AgentHtmlBlockWrapper,
} from "@/agent-html/runtime/block"

const blockHandleSource = readFileSync(
  fileURLToPath(new URL("./block-handle.tsx", import.meta.url)),
  "utf8"
)

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
    expect(html).toContain("data-agent-html-block-input-trigger=\"true\"")
    expect(html).toContain("aria-label=\"Block actions\"")
    expect(html).toContain("aria-label=\"Open block input\"")
    expect(html).not.toContain("data-agent-html-block-input=\"true\"")
    expect(html).not.toContain("Moving block")
    expect(html).not.toContain("overlayRect")
    expect(html).not.toContain("rect")
  })

  it("does not bind handle visibility to browser css hover", () => {
    expect(blockHandleSource).not.toContain("group-hover/agent-html-block")
  })
})
