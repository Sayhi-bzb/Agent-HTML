import * as React from "react"

import { cn } from "@/agent-html/lib/utils"
import { useAgentHtmlBlockRuntime } from "@/agent-html/runtime/block/block-runtime-provider"
import { AgentHtmlBlockHandle } from "@/agent-html/runtime/block/block-handle"

export const agentHtmlBlockWrapperClassName = cn(
  "group/agent-html-block relative rounded-[18px]",
  "bg-[color-mix(in_oklab,var(--primary)_0%,transparent)]",
  "outline outline-1 outline-offset-4 outline-[color-mix(in_oklab,var(--primary)_0%,transparent)]",
  "transition-[background-color,outline-color] duration-200 ease-out",
  "hover:bg-[color-mix(in_oklab,var(--primary)_4%,transparent)]",
  "hover:outline-[color-mix(in_oklab,var(--primary)_28%,transparent)]",
  "focus-within:bg-[color-mix(in_oklab,var(--primary)_4%,transparent)]",
  "focus-within:outline-[color-mix(in_oklab,var(--primary)_28%,transparent)]"
)

export function AgentHtmlBlockWrapper({
  children,
  className,
  path,
}: {
  children: React.ReactNode
  className?: string
  path: string
}) {
  const runtime = useAgentHtmlBlockRuntime()
  const ref = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    return runtime.registerBlockElement(path, ref.current)
  }, [path, runtime])

  const handlePointerEnter = React.useCallback(() => {
    runtime.setHoveredPath(path)
  }, [path, runtime])

  const handlePointerLeave = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (
        event.relatedTarget instanceof Node &&
        ref.current?.contains(event.relatedTarget)
      ) {
        return
      }

      runtime.setHoveredPath(null)
    },
    [runtime]
  )

  return (
    <div
      className={cn(agentHtmlBlockWrapperClassName, className)}
      data-agent-html-block="true"
      data-agent-html-block-path={path}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      ref={ref}
    >
      <AgentHtmlBlockHandle path={path} />
      {children}
    </div>
  )
}
