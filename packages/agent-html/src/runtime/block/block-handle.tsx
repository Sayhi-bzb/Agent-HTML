import type { DraggableAttributes, useDraggable } from "@dnd-kit/core"
import { GripVerticalIcon, PlusIcon } from "lucide-react"

import { cn } from "@/agent-html/lib/utils"

const agentHtmlBlockHandleButtonClassName = cn(
  "grid size-6 place-items-center",
  "text-foreground/40 opacity-0 transition-opacity duration-150",
  "hover:text-foreground/70",
  "data-visible:opacity-100",
  "group-focus-within/agent-html-block:opacity-100"
)

export function AgentHtmlBlockHandle({
  attributes,
  listeners,
  onInputTrigger,
  path,
  visible,
}: {
  attributes: DraggableAttributes
  listeners: ReturnType<typeof useDraggable>["listeners"]
  onInputTrigger?: (element: HTMLButtonElement) => void
  path: string
  visible?: boolean
}) {
  return (
    <div className="absolute top-1/2 -left-6 z-10 grid -translate-y-10 grid-rows-[1.5rem_1.5rem] gap-1">
      <button
        aria-label="Open block input"
        className={cn(agentHtmlBlockHandleButtonClassName, "cursor-pointer")}
        data-visible={visible ? "" : undefined}
        data-agent-html-block-input-trigger="true"
        data-agent-html-block-input-trigger-path={path}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onInputTrigger?.(event.currentTarget)
        }}
        onPointerDown={(event) => {
          event.stopPropagation()
        }}
        type="button"
      >
        <PlusIcon aria-hidden="true" className="size-4" />
      </button>
      <button
        aria-label="Block actions"
        className={cn(
          agentHtmlBlockHandleButtonClassName,
          "cursor-grab active:cursor-grabbing"
        )}
        data-visible={visible ? "" : undefined}
        data-agent-html-block-handle="true"
        data-agent-html-block-handle-path={path}
        type="button"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}
