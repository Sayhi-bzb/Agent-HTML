import * as React from "react"
import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/react"

import { cn } from "@/agent-html/lib/utils"
import type { AgentHtmlAgentPromptSubmitInput } from "@/agent-html/runtime/agent-events/types"
import { AgentHtmlBlockInputGroup } from "@/agent-html/runtime/block/block-input-group"

type BlockInputPopover = {
  anchorElement: HTMLElement
  path: string
}

type BlockInputPopoverPlacement = {
  left: number
  top: number
}

export function useAgentHtmlBlockInputPopover({
  onPromptSubmit,
}: {
  onPromptSubmit?: (input: AgentHtmlAgentPromptSubmitInput) => void
}) {
  const blockInputPopoverRef = React.useRef<HTMLDivElement | null>(null)
  const cleanupBlockInputAutoUpdateRef = React.useRef<(() => void) | null>(null)
  const [blockInputPopover, setBlockInputPopover] =
    React.useState<BlockInputPopover | null>(null)
  const [blockInputPopoverPlacement, setBlockInputPopoverPlacement] =
    React.useState<BlockInputPopoverPlacement | null>(null)

  const closeBlockInput = React.useCallback(() => {
    cleanupBlockInputAutoUpdateRef.current?.()
    cleanupBlockInputAutoUpdateRef.current = null
    setBlockInputPopover(null)
    setBlockInputPopoverPlacement(null)
  }, [])

  const openBlockInput = React.useCallback(
    (path: string, anchorElement: HTMLElement) => {
      setBlockInputPopover((current) => {
        if (current?.path === path && current.anchorElement === anchorElement) {
          return null
        }

        return { anchorElement, path }
      })
    },
    []
  )

  React.useEffect(() => {
    return () => {
      cleanupBlockInputAutoUpdateRef.current?.()
    }
  }, [])

  React.useLayoutEffect(() => {
    cleanupBlockInputAutoUpdateRef.current?.()
    cleanupBlockInputAutoUpdateRef.current = null

    if (!blockInputPopover) {
      return
    }

    const updateBlockInputPlacement = () => {
      const floatingElement = blockInputPopoverRef.current

      if (!floatingElement || !blockInputPopover.anchorElement.isConnected) {
        closeBlockInput()
        return
      }

      void computePosition(blockInputPopover.anchorElement, floatingElement, {
        middleware: [offset(12), flip(), shift({ padding: 12 })],
        placement: "right-start",
        strategy: "fixed",
      }).then(({ x, y }) => {
        setBlockInputPopoverPlacement({ left: x, top: y })
      })
    }

    cleanupBlockInputAutoUpdateRef.current = autoUpdate(
      blockInputPopover.anchorElement,
      blockInputPopoverRef.current ?? blockInputPopover.anchorElement,
      updateBlockInputPlacement
    )
    updateBlockInputPlacement()

    return () => {
      cleanupBlockInputAutoUpdateRef.current?.()
      cleanupBlockInputAutoUpdateRef.current = null
    }
  }, [blockInputPopover, closeBlockInput])

  React.useEffect(() => {
    if (!blockInputPopover) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        blockInputPopover.anchorElement.contains(target) ||
        blockInputPopoverRef.current?.contains(target)
      ) {
        return
      }

      closeBlockInput()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBlockInput()
      }
    }

    window.addEventListener("pointerdown", handlePointerDown, { capture: true })
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      })
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [blockInputPopover, closeBlockInput])

  const blockInputPopoverLayer = blockInputPopover ? (
    <div
      className={cn(
        "fixed z-50 w-[min(360px,calc(100vw-24px))]",
        blockInputPopoverPlacement ? "opacity-100" : "opacity-0"
      )}
      data-agent-html-block-input-popover="true"
      data-agent-html-block-input-path={blockInputPopover.path}
      ref={blockInputPopoverRef}
      style={{
        left: blockInputPopoverPlacement?.left ?? 0,
        top: blockInputPopoverPlacement?.top ?? 0,
      }}
    >
      <AgentHtmlBlockInputGroup
        onSend={(prompt) => {
          onPromptSubmit?.({
            prompt,
            target: {
              path: blockInputPopover.path,
            },
          })
          closeBlockInput()
        }}
        onPointerDown={(event) => {
          event.stopPropagation()
        }}
      />
    </div>
  ) : null

  return {
    blockInputPopoverLayer,
    closeBlockInput,
    openBlockInput,
  }
}
