import * as React from "react"

import { cn } from "@/agent-html/lib/utils"
import {
  AgentHtmlBlockIndicator,
  useAgentHtmlBlockRuntime,
} from "@/agent-html/runtime/block"
import { ScrollArea } from "@/agent-html/runtime/ui/scroll-area"

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (!ref) {
    return
  }

  if (typeof ref === "function") {
    ref(value)
    return
  }

  ref.current = value
}

export function AgentHtmlRuntimeViewport({
  children,
  className,
  contentClassName,
  onScroll,
  overlay,
  scrollAreaRef,
  showBlockIndicator = true,
  viewportRef,
}: {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  onScroll?: () => void
  overlay?: React.ReactNode
  scrollAreaRef?: React.Ref<HTMLDivElement>
  showBlockIndicator?: boolean
  viewportRef?: React.Ref<HTMLDivElement>
}) {
  const {
    activePath,
    refreshDragIntent,
    registerOverlayElement,
    setHoveredBlock,
  } = useAgentHtmlBlockRuntime()
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const scrollRootRef = React.useRef<HTMLDivElement | null>(null)

  const setRootRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      rootRef.current = element
      assignRef(viewportRef, element)
    },
    [viewportRef]
  )

  const setScrollRootRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      scrollRootRef.current = element
      assignRef(scrollAreaRef, element)
    },
    [scrollAreaRef]
  )

  React.useEffect(() => {
    return registerOverlayElement(rootRef.current)
  }, [registerOverlayElement])

  React.useEffect(() => {
    const scrollViewport = scrollRootRef.current?.querySelector<HTMLElement>(
      "[data-slot='scroll-area-viewport']"
    )

    if (!scrollViewport) {
      return
    }

    const handleScroll = () => {
      onScroll?.()

      if (activePath) {
        refreshDragIntent()
        return
      }

      setHoveredBlock(null)
    }

    scrollViewport.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      scrollViewport.removeEventListener("scroll", handleScroll)
    }
  }, [activePath, onScroll, refreshDragIntent, setHoveredBlock])

  return (
    <div
      className={cn(
        "relative h-full min-h-0 w-full min-w-0 overflow-hidden",
        className
      )}
      data-selection="text"
      ref={setRootRef}
    >
      <ScrollArea className="h-full w-full" ref={setScrollRootRef}>
        <div className={cn("w-full min-w-0 p-5", contentClassName)}>
          {children}
        </div>
      </ScrollArea>
      {showBlockIndicator ? <AgentHtmlBlockIndicator /> : null}
      {overlay}
    </div>
  )
}
