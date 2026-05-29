import type { SourceMetrics } from "@/agent-html/source"
import { SourcePanel } from "@example/features/source-viewer/source-panel"
import type { SourceTabValue } from "@example/features/source-viewer/types"
import { DialogContent } from "@example/ui"

export function SourceDialog({
  ahtmlMetrics,
  artifactSource,
  htmlMetrics,
  htmlSource,
  reactMetrics,
  reactSource,
  visitedTabs,
}: {
  ahtmlMetrics: SourceMetrics
  artifactSource: string
  htmlMetrics?: SourceMetrics
  htmlSource?: string
  reactMetrics: SourceMetrics
  reactSource: string
  visitedTabs: ReadonlySet<SourceTabValue>
}) {
  return (
    <DialogContent className="flex h-[min(90vh,60rem)] w-[min(92vw,72rem)] max-w-none grid-rows-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
      <SourcePanel
        ahtmlMetrics={ahtmlMetrics}
        artifactSource={artifactSource}
        htmlMetrics={htmlMetrics}
        htmlSource={htmlSource}
        reactMetrics={reactMetrics}
        reactSource={reactSource}
        visitedTabs={visitedTabs}
      />
    </DialogContent>
  )
}
