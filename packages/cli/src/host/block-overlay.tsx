import * as React from "react"
import { SparklesIcon } from "lucide-react"

import { artifactRenderedEventName } from "./api"
import { Button } from "./host-primitives"
import type { BlockOverlay, PromptTarget } from "./host-contracts"

export function useBlockOverlays(rootRef: React.RefObject<HTMLElement | null>) {
  const [overlays, setOverlays] = React.useState<BlockOverlay[]>([])

  const collectBlocks = React.useCallback(() => {
    const root = rootRef.current
    if (!root) {
      setOverlays([])
      return
    }

    const rootRect = root.getBoundingClientRect()
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>("[data-agent-html-block='true']")
    )

    setOverlays(
      blocks.map((element) => {
        const rect = element.getBoundingClientRect()
        const id = element.getAttribute("data-agent-html-block-id") ?? ""

        return {
          height: rect.height,
          id,
          title: element.getAttribute("data-agent-html-block-title") ?? id,
          width: rect.width,
          x: rect.left - rootRect.left,
          y: rect.top - rootRect.top,
        }
      })
    )
  }, [rootRef])

  React.useEffect(() => {
    window.addEventListener("resize", collectBlocks)
    window.addEventListener(artifactRenderedEventName, collectBlocks)

    return () => {
      window.removeEventListener("resize", collectBlocks)
      window.removeEventListener(artifactRenderedEventName, collectBlocks)
    }
  }, [collectBlocks])

  return { collectBlocks, overlays, setOverlays }
}

export function BlockOverlayLayer({
  onMessageBlock,
  overlays,
}: {
  onMessageBlock: (target: PromptTarget) => void
  overlays: BlockOverlay[]
}) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {overlays.map((overlay) => (
        <div
          className="group absolute rounded-md border border-transparent transition-colors hover:border-ring hover:bg-ring/5"
          key={overlay.id}
          style={{
            height: overlay.height,
            left: overlay.x,
            top: overlay.y,
            width: overlay.width,
          }}
        >
          <Button
            aria-label={`Message ${overlay.title}`}
            className="pointer-events-auto absolute top-2 left-2 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            onClick={() => onMessageBlock({ id: overlay.id, title: overlay.title })}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <SparklesIcon />
          </Button>
        </div>
      ))}
    </div>
  )
}
