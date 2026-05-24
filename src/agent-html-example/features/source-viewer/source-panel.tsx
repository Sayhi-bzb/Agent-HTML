import * as React from "react"

import type { SourceMetrics } from "@/agent-html"
import { CodeBlock } from "@/agent-html-example/features/source-viewer/code-block"
import type { SourceTabValue } from "@/agent-html-example/features/source-viewer/types"
import { ScrollArea, TabsContent, TabsList, TabsTrigger } from "@/agent-html-example/ui"

export const SourcePanel = React.memo(function SourcePanel({
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-2 pr-12">
        <TabsList variant="line">
          <TabsTrigger value="ahtml">ahtml</TabsTrigger>
          <TabsTrigger value="html">html</TabsTrigger>
          <TabsTrigger value="react">react</TabsTrigger>
        </TabsList>
        <div className="flex flex-wrap items-center gap-2 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground">
          <span>ahtml ~{ahtmlMetrics.approxTokens}</span>
          <span>html ~{htmlMetrics.approxTokens}</span>
          <span>react ~{reactMetrics.approxTokens}</span>
        </div>
      </div>
      <TabsContent
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
        forceMount
        value="ahtml"
      >
        <ScrollArea className="h-full w-full">
          <div className="min-w-max">
            {visitedTabs.has("ahtml") ? (
              <CodeBlock language="ahtml" source={ahtmlSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
        forceMount
        value="html"
      >
        <ScrollArea className="h-full w-full">
          <div className="min-w-max">
            {visitedTabs.has("html") ? (
              <CodeBlock language="html" source={htmlSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
        forceMount
        value="react"
      >
        <ScrollArea className="h-full w-full">
          <div className="min-w-max">
            {visitedTabs.has("react") ? (
              <CodeBlock language="react" source={reactSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
    </div>
  )
})
