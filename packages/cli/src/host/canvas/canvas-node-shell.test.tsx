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

vi.mock("../ui/context-menu", () => ({
  HostContextMenu: ({
    children,
    onOpenChange,
  }: React.PropsWithChildren<{
    onOpenChange?: (open: boolean) => void
  }>) => (
    <div data-context-menu-root="" onContextMenu={() => onOpenChange?.(true)}>
      {children}
    </div>
  ),
  HostContextMenuContent: ({ children }: React.PropsWithChildren) => children,
  HostContextMenuGroup: ({ children }: React.PropsWithChildren) => children,
  HostContextMenuItem: ({
    children,
    disabled,
    onSelect,
  }: React.PropsWithChildren<{
    disabled?: boolean
    onSelect?: () => void
  }>) => (
    <button disabled={disabled} onClick={onSelect}>
      {children}
    </button>
  ),
  HostContextMenuSeparator: () => <hr />,
  HostContextMenuTrigger: ({ children }: React.PropsWithChildren) => children,
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

  it("opens hierarchy actions in Pointer mode", () => {
    const container = document.createElement("div")
    const root = createRoot(container)
    const store = createCanvasStore("demo.canvas.tsx")
    store.runtime.upsertNode({ id: "card" })
    const onChooseParent = vi.fn()
    const onContextMenuOpen = vi.fn()
    const props = {
      data: {
        contentInteractive: false,
        moveToLabel: "Move to…",
        onChooseParent,
        onContextMenuOpen,
        persistLayout: vi.fn(),
        requestPersistLayout: vi.fn(),
        store,
      },
      id: "card",
      selected: true,
    } as unknown as NodeProps<CanvasFlowNode>

    act(() => root.render(<CanvasNodeShell {...props} />))
    act(() => {
      container
        .querySelector("[data-context-menu-root]")!
        .dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }))
    })
    expect(onContextMenuOpen).toHaveBeenCalledWith("card")
    act(() =>
      container.querySelector("button:not(.canvas-node-hit-layer)")!.click()
    )
    expect(onChooseParent).toHaveBeenCalledWith("card")
    act(() => root.unmount())
  })

  it("exposes stable layer actions after the hierarchy action", () => {
    const container = document.createElement("div")
    const root = createRoot(container)
    const store = createCanvasStore("demo.canvas.tsx")
    store.runtime.upsertNode({ id: "card" })
    const onReorder = vi.fn()
    const props = {
      data: {
        contentInteractive: false,
        layerActions: [
          {
            action: "bring-to-front",
            disabled: false,
            label: "Bring to Front",
          },
          {
            action: "bring-forward",
            disabled: true,
            label: "Bring Forward",
          },
        ],
        moveToLabel: "Move to…",
        onChooseParent: vi.fn(),
        onReorder,
        persistLayout: vi.fn(),
        requestPersistLayout: vi.fn(),
        store,
      },
      id: "card",
      selected: true,
    } as unknown as NodeProps<CanvasFlowNode>

    act(() => root.render(<CanvasNodeShell {...props} />))
    const buttons = [...container.querySelectorAll("button")].filter(
      (button) => !button.classList.contains("canvas-node-hit-layer")
    )
    expect(buttons.map((button) => button.textContent)).toEqual([
      "Move to…",
      "Bring to Front",
      "Bring Forward",
    ])
    expect(buttons[2].disabled).toBe(true)
    act(() => buttons[1].click())
    expect(onReorder).toHaveBeenCalledWith("card", "bring-to-front")
    act(() => root.unmount())
  })
})
