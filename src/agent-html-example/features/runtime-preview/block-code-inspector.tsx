import * as React from "react"

import { CodeBlock } from "@/agent-html-example/features/source-viewer/code-block"
import { cn } from "@/agent-html-example/lib/utils"

export type BlockCodeSnippet = {
  ahtml: string
  path: string
}

export function BlockCodeInspector({
  block,
  onHoverChange,
}: {
  block: BlockCodeSnippet | null
  onHoverChange: (hovering: boolean) => void
}) {
  return (
    <aside
      className={cn(
        "pointer-events-none absolute top-5 right-5 z-20 w-[min(28rem,42vw)] overflow-hidden rounded-2xl border border-border/70 bg-background/95 text-foreground opacity-0 shadow-2xl backdrop-blur transition-all duration-200 ease-out",
        block && "pointer-events-auto translate-y-0 opacity-100"
      )}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {block ? (
        <div className="max-h-[min(22rem,48vh)] overflow-auto">
          <CodeBlock
            className="min-w-full"
            language="ahtml"
            source={block.ahtml}
          />
        </div>
      ) : null}
    </aside>
  )
}
