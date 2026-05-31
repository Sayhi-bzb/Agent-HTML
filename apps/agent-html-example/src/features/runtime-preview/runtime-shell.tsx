import * as React from "react"

import type { SourceMetrics } from "@/agent-html/source"
import type { AgentHtmlExampleLocale } from "@example/cases"
import type { ExampleThemeId } from "@example/theme/theme-presets"
import { RenderPanel } from "@example/features/runtime-preview/render-panel"
import { RuntimeHeader } from "@example/features/runtime-preview/runtime-header"
import {
  isSourceTabValue,
  type SourceTabValue,
} from "@example/features/source-viewer/types"
import { Dialog, Tabs } from "@example/ui"

const SourceDialog = React.lazy(() =>
  import("@example/features/runtime-preview/source-dialog").then((module) => ({
    default: module.SourceDialog,
  }))
)

export function RuntimeShell({
  ahtmlMetrics,
  artifactSource,
  children,
  blockSummaries,
  htmlMetrics,
  htmlSource,
  locale,
  onLocaleChange,
  onThemeChange,
  reactMetrics,
  reactSource,
  theme,
}: {
  ahtmlMetrics: SourceMetrics
  artifactSource: string
  children: React.ReactNode
  blockSummaries: Record<string, string>
  htmlMetrics?: SourceMetrics
  htmlSource?: string
  locale: AgentHtmlExampleLocale
  onLocaleChange: (locale: AgentHtmlExampleLocale) => void
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
          locale={locale}
          onLocaleChange={onLocaleChange}
          onThemeChange={onThemeChange}
          theme={theme}
        />
        <main className="mt-3 min-h-0 w-full min-w-0 flex-1">
          <RenderPanel blockSummaries={blockSummaries}>{children}</RenderPanel>
        </main>
        <React.Suspense fallback={null}>
          <SourceDialog
            ahtmlMetrics={ahtmlMetrics}
            artifactSource={artifactSource}
            htmlMetrics={htmlMetrics}
            htmlSource={htmlSource}
            reactMetrics={reactMetrics}
            reactSource={reactSource}
            visitedTabs={visitedTabs}
          />
        </React.Suspense>
      </Tabs>
    </Dialog>
  )
}
