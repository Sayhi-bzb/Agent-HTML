import * as React from "react"

import { CodeBlock } from "@/agent-html/runtime/code-block"
import type { SourceMetrics } from "@/agent-html/runtime/source-metrics"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/agent-html/runtime/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export function RuntimeShell({
  ahtmlMetrics,
  children,
  ahtmlSource,
  htmlMetrics,
  htmlSource,
  reactMetrics,
  reactSource,
  title,
}: {
  ahtmlMetrics: SourceMetrics
  children: React.ReactNode
  ahtmlSource: string
  htmlMetrics: SourceMetrics
  htmlSource: string
  reactMetrics: SourceMetrics
  reactSource: string
  title: string
}) {
  return (
    <div className="grid min-h-screen gap-6 bg-background p-6 text-foreground lg:grid-cols-[minmax(0,1.4fr)_minmax(22rem,0.9fr)]">
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-[var(--preview-card-shadow)]">
        <header className="border-b border-border/70 px-5 py-4">
          <h1 className="text-[length:var(--type-xl)] leading-[calc(var(--type-base-line-height)*0.92)] font-medium">
            {title}
          </h1>
          <p className="mt-1 text-[length:var(--type-sm)] leading-[var(--type-base-line-height)] text-muted-foreground">
            Runtime preview for the agent-html DSL.
          </p>
        </header>
        <ScrollArea className="h-[calc(100vh-11rem)]">
          <div className="p-5">{children}</div>
        </ScrollArea>
      </section>

      <aside className="overflow-hidden rounded-2xl border border-border/80 bg-card/70 shadow-[var(--preview-card-shadow)]">
        <Tabs className="gap-0" defaultValue="ahtml">
          <header className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <h2 className="text-[length:var(--type-lg)] leading-[calc(var(--type-base-line-height)*0.92)] font-medium">
                Source
              </h2>
              <div className="hidden items-center gap-2 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground lg:flex">
                <span>ahtml ~{ahtmlMetrics.approxTokens}</span>
                <span>html ~{htmlMetrics.approxTokens}</span>
                <span>react ~{reactMetrics.approxTokens}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center gap-2 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground lg:hidden">
                <span>a:{ahtmlMetrics.approxTokens}</span>
                <span>h:{htmlMetrics.approxTokens}</span>
                <span>r:{reactMetrics.approxTokens}</span>
              </div>
              <TabsList>
                <TabsTrigger value="ahtml">ahtml</TabsTrigger>
                <TabsTrigger value="html">html</TabsTrigger>
                <TabsTrigger value="react">react</TabsTrigger>
              </TabsList>
            </div>
          </header>
          <TabsContent value="ahtml">
            <ScrollArea className="h-[calc(100vh-11rem)] w-full">
              <div className="min-w-max">
                <CodeBlock language="ahtml" source={ahtmlSource} />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="html">
            <ScrollArea className="h-[calc(100vh-11rem)] w-full">
              <div className="min-w-max">
                <CodeBlock language="html" source={htmlSource} />
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="react">
            <ScrollArea className="h-[calc(100vh-11rem)] w-full">
              <div className="min-w-max">
                <CodeBlock language="react" source={reactSource} />
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  )
}


