import * as React from "react"

import type { SourceMetrics } from "@/agent-html"
import { CodeBlock } from "@/agent-html-example/code-block"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/agent-html/ui"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
    <div className="h-full w-full min-w-0 overflow-hidden">
      <ScrollArea className="h-[calc(100vh-9rem)] w-full">
        <div className="w-full min-w-0 p-5">{children}</div>
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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

function RuntimeHeader({
  title,
}: {
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
      <DialogTrigger asChild>
        <Button variant="outline">Source</Button>
      </DialogTrigger>
    </header>
  )
}

function SourceDialog({
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

  return (
    <Dialog>
      <Tabs
        className="min-h-screen w-full max-w-none gap-0 overflow-x-hidden bg-background p-6 text-foreground"
        onValueChange={handleSourceTabChange}
        value={activeSourceTab}
      >
        <RuntimeHeader title={title} />
        <main className="mt-6 w-full min-w-0">
          <RenderPanel>{children}</RenderPanel>
        </main>
        <SourceDialog
          ahtmlMetrics={ahtmlMetrics}
          ahtmlSource={ahtmlSource}
          htmlMetrics={htmlMetrics}
          htmlSource={htmlSource}
          reactMetrics={reactMetrics}
          reactSource={reactSource}
          visitedTabs={visitedTabs}
        />
      </Tabs>
    </Dialog>
  )
}


