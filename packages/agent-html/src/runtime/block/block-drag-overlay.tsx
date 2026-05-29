import * as React from "react"

import { cn } from "@/agent-html/lib/utils"
import type { AgentHtmlBlockLayoutRect } from "@/agent-html/runtime/block/layout-transition"

type AgentHtmlBlockDragOverlayProps = {
  preview: {
    node: React.ReactNode
    rect: AgentHtmlBlockLayoutRect
  } | null
}

export function AgentHtmlBlockDragOverlay({
  preview,
}: AgentHtmlBlockDragOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none overflow-hidden rounded-[18px] bg-background/92 text-foreground shadow-[0_22px_48px_-24px_color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur",
        "border border-[color-mix(in_oklab,var(--primary)_28%,var(--border))] ring-1 ring-[color-mix(in_oklab,var(--primary)_24%,transparent)]"
      )}
      data-agent-html-block-drag-overlay="true"
      style={{
        maxWidth: "calc(100vw - 32px)",
        width: preview?.rect.width,
      }}
    >
      <div className="p-0">{preview?.node}</div>
    </div>
  )
}
