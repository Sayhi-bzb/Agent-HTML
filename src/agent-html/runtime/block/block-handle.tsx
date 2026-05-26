import type { DraggableAttributes, useDraggable } from "@dnd-kit/core"

import { cn } from "@/agent-html/lib/utils"

export function AgentHtmlBlockHandle({
  attributes,
  listeners,
  path,
}: {
  attributes: DraggableAttributes
  listeners: ReturnType<typeof useDraggable>["listeners"]
  path: string
}) {
  return (
    <button
      aria-label="Block actions"
      className={cn(
        "absolute top-1/2 -left-6 z-10 grid size-6 -translate-y-1/2 place-items-center rounded-md",
        "cursor-grab text-foreground/40 opacity-0 transition-opacity duration-150",
        "hover:bg-foreground/5 hover:text-foreground/70 active:cursor-grabbing",
        "group-hover/agent-html-block:opacity-100 group-focus-within/agent-html-block:opacity-100"
      )}
      data-agent-html-block-handle="true"
      data-agent-html-block-handle-path={path}
      type="button"
      {...attributes}
      {...listeners}
    >
      <span
        aria-hidden="true"
        className="grid grid-cols-2 gap-0.5"
      >
        <i className="size-1 rounded-full bg-current" />
        <i className="size-1 rounded-full bg-current" />
        <i className="size-1 rounded-full bg-current" />
        <i className="size-1 rounded-full bg-current" />
        <i className="size-1 rounded-full bg-current" />
        <i className="size-1 rounded-full bg-current" />
      </span>
    </button>
  )
}
