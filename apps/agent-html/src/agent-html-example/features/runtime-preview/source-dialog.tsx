import type { SourceMetrics } from "@/agent-html"
import { SourcePanel } from "@/agent-html-example/features/source-viewer/source-panel"
import type { SourceTabValue } from "@/agent-html-example/features/source-viewer/types"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  TabsList,
  TabsTrigger,
} from "@/agent-html-example/ui"

export function SourceDialog({
  ahtmlMetrics,
  ahtmlSource,
  htmlMetrics,
  htmlSource,
  reactMetrics,
  reactSource,
  visitedTabs,
}: {
  ahtmlMetrics: SourceMetrics
  ahtmlSource: string
  htmlMetrics: SourceMetrics
  htmlSource: string
  reactMetrics: SourceMetrics
  reactSource: string
  visitedTabs: ReadonlySet<SourceTabValue>
}) {
  return (
    <DialogContent className="flex h-[min(90vh,60rem)] w-[min(92vw,72rem)] max-w-none grid-rows-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
      <DialogHeader className="gap-4 border-b border-border/70 p-4 pr-12">
        <div>
          <DialogTitle>Source</DialogTitle>
          <DialogDescription>
            Compare agent-html, generated HTML, and equivalent React.
          </DialogDescription>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground">
            <span>ahtml ~{ahtmlMetrics.approxTokens}</span>
            <span>html ~{htmlMetrics.approxTokens}</span>
            <span>react ~{reactMetrics.approxTokens}</span>
          </div>
          <TabsList>
            <TabsTrigger value="ahtml">ahtml</TabsTrigger>
            <TabsTrigger value="html">html</TabsTrigger>
            <TabsTrigger value="react">react</TabsTrigger>
          </TabsList>
        </div>
      </DialogHeader>
      <SourcePanel
        ahtmlSource={ahtmlSource}
        htmlSource={htmlSource}
        reactSource={reactSource}
        visitedTabs={visitedTabs}
      />
    </DialogContent>
  )
}
