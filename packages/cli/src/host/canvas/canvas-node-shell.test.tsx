// @vitest-environment jsdom

import * as React from "react"
import { act } from "react"
import { createRoot } from "react-dom/client"
import type { NodeProps } from "@xyflow/react"
import { describe, expect, it, vi } from "vitest"

import type { CanvasFlowNode } from "./canvas-flow-model"
import { CanvasNodeShell } from "./canvas-node-shell"
import { createCanvasStore } from "./canvas-store"

vi.mock("@xyflow/react", () => ({
  NodeResizer: ({ isVisible }: { isVisible: boolean }) => (
    <div data-resizer-visible={isVisible ? "" : undefined} />
  ),
}))

globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe("Canvas Node interaction boundary", () => {
  it("switches between spatial hit testing and live React content", () => {
    const container = document.createElement("div")
    const root = createRoot(container)
    const store = createCanvasStore("demo.canvas.tsx")
    store.runtime.upsertNode({ id: "card" })

    const props = (contentInteractive: boolean) =>
      ({
        data: {
          contentInteractive,
          persistLayout: vi.fn(),
          requestPersistLayout: vi.fn(),
          store,
        },
        id: "card",
        selected: true,
      }) as unknown as NodeProps<CanvasFlowNode>

    act(() => root.render(<CanvasNodeShell {...props(false)} />))
    const content = container.querySelector<HTMLElement>(
      "[data-canvas-region='node-content']"
    )!
    const statefulChild = document.createElement("input")
    statefulChild.value = "retained"
    content.append(statefulChild)
    expect(content.hasAttribute("inert")).toBe(true)
    expect(container.querySelector(".canvas-node-hit-layer")).not.toBeNull()
    expect(container.querySelector("[data-resizer-visible]")).not.toBeNull()

    act(() => root.render(<CanvasNodeShell {...props(true)} />))
    const interactiveContent = container.querySelector<HTMLElement>(
      "[data-canvas-region='node-content']"
    )!
    expect(interactiveContent).toBe(content)
    expect(interactiveContent.hasAttribute("inert")).toBe(false)
    expect(statefulChild.value).toBe("retained")
    expect(container.querySelector(".canvas-node-hit-layer")).toBeNull()
    expect(container.querySelector("[data-resizer-visible]")).toBeNull()
    act(() => root.unmount())
  })
})
