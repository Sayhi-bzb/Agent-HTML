import * as React from "react"

import type { SourceMetrics } from "@/agent-html"
import type { ExampleThemeId } from "@/agent-html-example/theme/theme-presets"
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
  blockSummaries,
  htmlMetrics,
  htmlSource,
  onThemeChange,
  reactMetrics,
  reactSource,
  theme,
}: {
  ahtmlMetrics: SourceMetrics
  children: React.ReactNode
  ahtmlSource: string
  blockSummaries: Record<string, string>
  htmlMetrics: SourceMetrics
  htmlSource: string
  onThemeChange: (theme: ExampleThemeId) => void
  reactMetrics: SourceMetrics
  reactSource: string
  theme: ExampleThemeId
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
        <RuntimeHeader
          onThemeChange={onThemeChange}
          theme={theme}
        />
        <main className="mt-3 min-h-0 w-full min-w-0 flex-1">
          <RenderPanel blockSummaries={blockSummaries}>{children}</RenderPanel>
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
