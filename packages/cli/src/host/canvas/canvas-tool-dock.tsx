import * as React from "react"
import { HandIcon, MousePointer2Icon } from "lucide-react"

import { HostButton } from "../ui/button"
import type { CanvasTool } from "./canvas-interaction-machine"

const tools = ["select", "navigate"] as const

export function CanvasToolDock({
  onToolChange,
  tool,
}: {
  onToolChange: (tool: CanvasTool) => void
  tool: CanvasTool
}) {
  const buttons = React.useRef<Array<HTMLButtonElement | null>>([])
  const focusTool = (index: number) => {
    buttons.current[(index + tools.length) % tools.length]?.focus()
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const current = buttons.current.indexOf(event.target as HTMLButtonElement)
    if (current < 0) return
    if (event.key === "ArrowLeft") focusTool(current - 1)
    else if (event.key === "ArrowRight") focusTool(current + 1)
    else if (event.key === "Home") focusTool(0)
    else if (event.key === "End") focusTool(tools.length - 1)
    else return
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div
      aria-label="Canvas tools"
      className="canvas-tool-dock"
      data-canvas-region="dock"
      onKeyDown={handleKeyDown}
      role="toolbar"
    >
      <HostButton
        aria-keyshortcuts="V"
        aria-label="Pointer tool"
        aria-pressed={tool === "select"}
        className="canvas-tool-dock__button"
        onClick={() => onToolChange("select")}
        ref={(element) => {
          buttons.current[0] = element
        }}
        tabIndex={tool === "select" ? 0 : -1}
        title="Pointer (V)"
        type="button"
        variant="ghost"
      >
        <MousePointer2Icon />
      </HostButton>
      <HostButton
        aria-keyshortcuts="H"
        aria-label="Hand tool"
        aria-pressed={tool === "navigate"}
        className="canvas-tool-dock__button"
        onClick={() => onToolChange("navigate")}
        ref={(element) => {
          buttons.current[1] = element
        }}
        tabIndex={tool === "navigate" ? 0 : -1}
        title="Hand (H)"
        type="button"
        variant="ghost"
      >
        <HandIcon />
      </HostButton>
    </div>
  )
}
