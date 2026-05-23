import * as React from "react"

import type { SourceMetrics } from "@/agent-html"
import { CodeBlock } from "@/agent-html-example/code-block"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/agent-html/ui"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"

type SourceTabValue = "ahtml" | "html" | "react"

const sourceTabValues: SourceTabValue[] = ["ahtml", "html", "react"]

function isSourceTabValue(value: string): value is SourceTabValue {
  return sourceTabValues.includes(value as SourceTabValue)
}

const RenderPanel = React.memo(function RenderPanel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full overflow-hidden">
      <ScrollArea className="h-[calc(100vh-9rem)]">
        <div className="p-5">{children}</div>
      </ScrollArea>
    </div>
  )
})

const SourcePanel = React.memo(function SourcePanel({
  ahtmlSource,
  htmlSource,
  reactSource,
  visitedTabs,
}: {
  ahtmlSource: string
  htmlSource: string
  reactSource: string
  visitedTabs: ReadonlySet<SourceTabValue>
}) {
  return (
    <aside className="h-full overflow-hidden">
      <TabsContent
        className="data-[state=inactive]:hidden"
        forceMount
        value="ahtml"
      >
        <ScrollArea className="h-[calc(100vh-9rem)] w-full">
          <div className="min-w-max">
            {visitedTabs.has("ahtml") ? (
              <CodeBlock language="ahtml" source={ahtmlSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent
        className="data-[state=inactive]:hidden"
        forceMount
        value="html"
      >
        <ScrollArea className="h-[calc(100vh-9rem)] w-full">
          <div className="min-w-max">
            {visitedTabs.has("html") ? (
              <CodeBlock language="html" source={htmlSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent
        className="data-[state=inactive]:hidden"
        forceMount
        value="react"
      >
        <ScrollArea className="h-[calc(100vh-9rem)] w-full">
          <div className="min-w-max">
            {visitedTabs.has("react") ? (
              <CodeBlock language="react" source={reactSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
    </aside>
  )
})

function RuntimeHeader({
  ahtmlMetrics,
  htmlMetrics,
  reactMetrics,
  title,
}: {
  ahtmlMetrics: SourceMetrics
  htmlMetrics: SourceMetrics
  reactMetrics: SourceMetrics
  title: string
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border/70 px-1 pb-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-[length:var(--type-xl)] leading-[calc(var(--type-base-line-height)*0.92)] font-medium">
          {title}
        </h1>
        <p className="mt-1 text-[length:var(--type-sm)] leading-[var(--type-base-line-height)] text-muted-foreground">
          Runtime preview for the agent-html DSL.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="hidden items-center gap-2 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground sm:flex">
          <span>ahtml ~{ahtmlMetrics.approxTokens}</span>
          <span>html ~{htmlMetrics.approxTokens}</span>
          <span>react ~{reactMetrics.approxTokens}</span>
        </div>
        <div className="flex items-center gap-2 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)] text-muted-foreground sm:hidden">
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
  )
}

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
  const [activeSourceTab, setActiveSourceTab] =
    React.useState<SourceTabValue>("ahtml")
  const [visitedTabs, setVisitedTabs] = React.useState<
    ReadonlySet<SourceTabValue>
  >(() => new Set<SourceTabValue>(["ahtml"]))

  const handleSourceTabChange = React.useCallback((value: string) => {
    if (!isSourceTabValue(value)) {
      return
    }

    React.startTransition(() => {
      setActiveSourceTab(value)
      setVisitedTabs((current) => {
        if (current.has(value)) {
          return current
        }

        const next = new Set(current)
        next.add(value)
        return next
      })
    })
  }, [])

  const renderPanel = <RenderPanel>{children}</RenderPanel>
  const sourcePanel = (
    <SourcePanel
      ahtmlSource={ahtmlSource}
      htmlSource={htmlSource}
      reactSource={reactSource}
      visitedTabs={visitedTabs}
    />
  )

  return (
    <Tabs
      className="min-h-screen gap-0 bg-background p-6 text-foreground"
      onValueChange={handleSourceTabChange}
      value={activeSourceTab}
    >
      <RuntimeHeader
        ahtmlMetrics={ahtmlMetrics}
        htmlMetrics={htmlMetrics}
        reactMetrics={reactMetrics}
        title={title}
      />

      <div className="mt-6 flex flex-col gap-6 lg:hidden">
        {renderPanel}
        {sourcePanel}
      </div>

      <div className="mt-6 hidden lg:block">
        <ResizablePanelGroup
          className="min-h-[calc(100vh-9rem)] gap-6"
          orientation="horizontal"
        >
          <ResizablePanel defaultSize={60} minSize={35}>
            {renderPanel}
          </ResizablePanel>
          <ResizableHandle className="bg-transparent" withHandle />
          <ResizablePanel defaultSize={40} minSize={28}>
            {sourcePanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </Tabs>
  )
}


