import { cn } from "@/agent-html/lib/utils"

export const agentHtmlBlockWrapperClassName = cn(
  "group/agent-html-block relative rounded-[18px]",
  "bg-[color-mix(in_oklab,var(--primary)_0%,transparent)]",
  "outline outline-1 outline-offset-4 outline-[color-mix(in_oklab,var(--primary)_0%,transparent)]",
  "transition-[background-color,opacity,outline-color] duration-200 ease-out",
  "data-hovered:bg-[color-mix(in_oklab,var(--primary)_4%,transparent)]",
  "data-hovered:outline-[color-mix(in_oklab,var(--primary)_28%,transparent)]",
  "focus-within:bg-[color-mix(in_oklab,var(--primary)_4%,transparent)]",
  "focus-within:outline-[color-mix(in_oklab,var(--primary)_28%,transparent)]"
)

export const agentHtmlBlockInteractiveClassName = cn(
  "bg-[color-mix(in_oklab,var(--primary)_4%,transparent)]",
  "outline-[color-mix(in_oklab,var(--primary)_28%,transparent)]"
)

export const agentHtmlBlockDraggingClassName = cn(
  agentHtmlBlockInteractiveClassName,
  "opacity-45"
)
