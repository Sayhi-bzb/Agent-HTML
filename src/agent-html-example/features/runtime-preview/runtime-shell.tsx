import * as React from "react"

import type { SourceMetrics } from "@/agent-html"
import { RenderPanel } from "@/agent-html-example/features/runtime-preview/render-panel"
import { RuntimeHeader } from "@/agent-html-example/features/runtime-preview/runtime-header"
import { SourceDialog } from "@/agent-html-example/features/runtime-preview/source-dialog"
import {
  isSourceTabValue,
  type SourceTabValue,
} from "@/agent-html-example/features/source-viewer/types"
import { Dialog, Tabs } from "@/agent-html-example/ui"

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
        className="flex h-full min-h-0 w-full max-w-none flex-col gap-0 overflow-hidden bg-background p-6 text-foreground"
        onValueChange={handleSourceTabChange}
        value={activeSourceTab}
      >
        <RuntimeHeader title={title} />
        <main className="mt-3 min-h-0 w-full min-w-0 flex-1">
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
