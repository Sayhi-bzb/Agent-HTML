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
    activePath,
    hoveredPath,
    registerBlockElement,
    registerBlockPreview,
    registerBlockUnit,
    setHoveredPath,
  } = runtime
  const ref = React.useRef<HTMLDivElement | null>(null)
  const isActive = activePath === path
  const isHovered = hoveredPath === path && !activePath
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

  React.useEffect(() => {
    return registerBlockUnit(path, unit)
  }, [path, registerBlockUnit, unit])

  const handlePointerEnter = React.useCallback(() => {
    if (activePath) {
      return
    }

    setHoveredPath(path)
  }, [activePath, path, setHoveredPath])

  const handlePointerLeave = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        event.relatedTarget instanceof Node &&
        ref.current?.contains(event.relatedTarget)
      ) {
        return
      }

      setHoveredPath(null)
    },
    [setHoveredPath]
  )

  return (
    <div
      className={cn(
        agentHtmlBlockWrapperClassName,
        isHovered && agentHtmlBlockInteractiveClassName,
        isActive && agentHtmlBlockDraggingClassName,
        className
      )}
      data-agent-html-block="true"
      data-agent-html-block-path={path}
      data-agent-html-block-active={isActive ? "true" : undefined}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      ref={setWrapperRef}
    >
      <AgentHtmlBlockHandle
        attributes={attributes}
        listeners={listeners}
        path={path}
      />
      {children}
    </div>
  )
}
