import * as React from "react"

import {
  BlockCodeInspector,
  type BlockCodeSnippet,
} from "@/agent-html-example/features/runtime-preview/block-code-inspector"
import { ScrollArea } from "@/agent-html-example/ui"

export const RenderPanel = React.memo(function RenderPanel({
  activeBlockCode,
  children,
  onInspectorHoverChange,
}: {
  activeBlockCode?: BlockCodeSnippet | null
  children: React.ReactNode
  onInspectorHoverChange?: (hovering: boolean) => void
}) {
  return (
    <div className="relative h-full min-h-0 w-full min-w-0 overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div className="w-full min-w-0 p-5">{children}</div>
      </ScrollArea>
      <BlockCodeInspector
        block={activeBlockCode ?? null}
        onHoverChange={onInspectorHoverChange ?? (() => {})}
      />
    </div>
  )
})
