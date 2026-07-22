import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import type * as React from "react"

import { ScrollArea } from "#agent-html-playground/components/ui/scroll-area"
import { HostButton } from "./button"

export type WorkspaceSplitViewPanel = "main" | "pane"

export function WorkspaceSplitView({
  main,
  mainLabel,
  narrowPanel,
  onNarrowPanelChange,
  pane,
  paneLabel,
}: {
  main: React.ReactNode
  mainLabel: string
  narrowPanel: WorkspaceSplitViewPanel
  onNarrowPanelChange: (panel: WorkspaceSplitViewPanel) => void
  pane: React.ReactNode
  paneLabel: string
}) {
  return (
    <div className="workspace-split-view" data-narrow-panel={narrowPanel}>
      <div className="workspace-split-view__layout">
        <aside aria-label={paneLabel} className="workspace-split-view__pane">
          <div className="workspace-split-view__narrow-navigation">
            <HostButton
              className="workspace-split-view__narrow-action"
              onClick={() => onNarrowPanelChange("main")}
              size="sm"
              type="button"
              variant="ghost"
            >
              {mainLabel}
              <ChevronRightIcon data-icon="inline-end" />
            </HostButton>
          </div>
          <ScrollArea className="workspace-split-view__pane-content">
            {pane}
          </ScrollArea>
        </aside>
        <section aria-label={mainLabel} className="workspace-split-view__main">
          <div className="workspace-split-view__narrow-navigation">
            <HostButton
              className="workspace-split-view__narrow-action"
              onClick={() => onNarrowPanelChange("pane")}
              size="sm"
              type="button"
              variant="ghost"
            >
              <ChevronLeftIcon data-icon="inline-start" />
              {paneLabel}
            </HostButton>
          </div>
          <div className="workspace-split-view__main-content">{main}</div>
        </section>
      </div>
    </div>
  )
}
