import type { ReactNode } from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { normalizePanelLayout, persistPanelLayout } from "@/features/app-shell/panel-layout"
import { shellPanelConstraints } from "@/features/app-shell/layout"
import type {
  PanelLayoutState,
  ShellChromeState,
} from "@/features/app-shell/types"

type MainLayoutProps = {
  panelLayout: PanelLayoutState
  shellChrome: ShellChromeState
  onPanelLayoutChange: (layout: PanelLayoutState) => void
  sessions: ReactNode
  workbench: ReactNode
  shell: ReactNode
}

export function MainLayout({
  panelLayout,
  shellChrome,
  onPanelLayoutChange,
  sessions,
  workbench,
  shell,
}: MainLayoutProps) {
  return (
    <div className="app-shell-body">
      <ResizablePanelGroup
        className="app-shell-fill-layout"
        onLayoutChanged={(layout) => {
          const nextLayout = normalizePanelLayout(layout)
          onPanelLayoutChange(nextLayout)
          persistPanelLayout(nextLayout)
        }}
        orientation="horizontal"
      >
        {shellChrome.leftPanelVisible ? (
          <>
            <ResizablePanel
              defaultSize={panelLayout.sessions}
              id="sessions"
              minSize={shellPanelConstraints.sessions.minSize}
            >
              <div className="app-shell-rail-frame">{sessions}</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        ) : null}
        <ResizablePanel
          defaultSize={panelLayout.workbench}
          id="workbench"
          minSize={shellPanelConstraints.workbench.minSize}
        >
          <div className="app-shell-workbench-frame">{workbench}</div>
        </ResizablePanel>
        {shellChrome.rightPanelVisible ? (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={panelLayout.shell}
              id="shell"
              minSize={shellPanelConstraints.shell.minSize}
            >
              <div className="app-shell-review-frame">{shell}</div>
            </ResizablePanel>
          </>
        ) : null}
      </ResizablePanelGroup>
    </div>
  )
}
