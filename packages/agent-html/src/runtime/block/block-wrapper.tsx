import * as React from "react"
import { useDraggable } from "@dnd-kit/core"

import type { AgentHtmlInteractionUnit } from "@/agent-html/interaction/types"
import { cn } from "@/agent-html/lib/utils"
import { useAgentHtmlBlockRuntime } from "@/agent-html/runtime/block/block-runtime-provider"
import { AgentHtmlBlockHandle } from "@/agent-html/runtime/block/block-handle"

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

const agentHtmlBlockInteractiveClassName = cn(
  "bg-[color-mix(in_oklab,var(--primary)_4%,transparent)]",
  "outline-[color-mix(in_oklab,var(--primary)_28%,transparent)]"
)

const agentHtmlBlockDraggingClassName = cn(
  agentHtmlBlockInteractiveClassName,
  "opacity-45"
)

export function AgentHtmlBlockWrapper({
  children,
  className,
  path,
  unit,
}: {
  children: React.ReactNode
  className?: string
  path: string
  unit: AgentHtmlInteractionUnit
}) {
  const runtime = useAgentHtmlBlockRuntime()
  const {
    activeMotionKey,
    activePath,
    hoveredPath,
    landingMotionKey,
    openBlockInput,
    registerBlockElement,
    registerBlockPreview,
    registerBlockUnit,
  } = runtime
  const ref = React.useRef<HTMLDivElement | null>(null)
  const isActive = activeMotionKey === unit.motionKey
  const isHovered = hoveredPath === path && !activePath
  const isLanding = landingMotionKey === unit.motionKey
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: path,
  })

  const setWrapperRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      ref.current = element
      setNodeRef(element)
    },
    [setNodeRef]
  )

  React.useLayoutEffect(() => {
    return registerBlockElement(path, ref.current)
  }, [path, registerBlockElement])

  React.useEffect(() => {
    return registerBlockPreview(path, children)
  }, [children, path, registerBlockPreview])

  React.useLayoutEffect(() => {
    // Landing and FLIP resolve targets during layout effects, so unit metadata
    // must be in sync with DOM registration before those effects run.
    return registerBlockUnit(path, unit)
  }, [path, registerBlockUnit, unit])

  const handleInputTrigger = React.useCallback(
    (element: HTMLButtonElement) => {
      openBlockInput(path, element)
    },
    [openBlockInput, path]
  )

  return (
    <div
      className={cn(
        agentHtmlBlockWrapperClassName,
        isHovered && agentHtmlBlockInteractiveClassName,
        isActive && agentHtmlBlockDraggingClassName,
        isLanding && "opacity-0",
        className
      )}
      data-agent-html-block="true"
      data-agent-html-block-path={path}
      data-agent-html-block-active={isActive ? "true" : undefined}
      data-hovered={isHovered ? "" : undefined}
      data-agent-html-block-landing={isLanding ? "true" : undefined}
      ref={setWrapperRef}
    >
      <AgentHtmlBlockHandle
        attributes={attributes}
        listeners={listeners}
        onInputTrigger={handleInputTrigger}
        path={path}
        visible={isHovered}
      />
      {children}
    </div>
  )
}
