import { useState } from "react"
import { FileCode2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { isTauriRuntime } from "@/lib/tauri"

import {
  normalizePanelLayout,
  persistPanelLayout,
  readStoredPanelLayout,
} from "./features/app-shell/panel-layout"
import { shellPanelConstraints } from "./features/app-shell/layout"
import type { PanelLayoutState } from "./features/app-shell/types"
import { useWorkbenchApp } from "./features/app-shell/use-workbench-app"
import { SessionRail } from "./features/sessions/components/session-rail"
import { ShellPane } from "./features/shell/components/shell-pane"
import { WorkbenchPane } from "./features/workbench/components/workbench-pane"

export function App() {
  const {
    appState,
    previewHtml,
    activeView,
    draftSource,
    messageDraft,
    validation,
    runtimeReport,
    commandState,
    currentSession,
    currentBuild,
    currentInspect,
    currentLogs,
    hasUnsavedChanges,
    filteredMessages,
    setDraftSource,
    setMessageDraft,
    actions,
  } = useWorkbenchApp()
  const [panelLayout, setPanelLayout] = useState<PanelLayoutState>(
    readStoredPanelLayout,
  )

  return (
    <div className="app-shell">
      <div className="app-shell-frame">
        <header className="app-shell-topbar">
          <div className="app-shell-topbar-row">
            <div className="app-shell-topbar-group min-w-0">
              <div className="app-shell-panel-icon">
                <FileCode2Icon className="app-shell-inline-icon" />
              </div>
              <div className="min-w-0">
                <p className="app-shell-panel-title">agent-html</p>
                <p className="truncate app-shell-supporting-copy">
                  {currentSession.summary.directory}
                </p>
              </div>
            </div>
            <div className="app-shell-status-group">
              <Badge variant="outline">{isTauriRuntime() ? "tauri" : "mock"}</Badge>
              <Badge variant="secondary">{activeView}</Badge>
              {commandState.error ? <Badge variant="destructive">error</Badge> : null}
            </div>
          </div>
        </header>

        {commandState.error ? (
          <div className="app-shell-error-banner">
            {commandState.error}
          </div>
        ) : null}

        <div className="app-shell-body">
          <ResizablePanelGroup
            className="h-full"
            onLayoutChanged={(layout) => {
              const nextLayout = normalizePanelLayout(layout)
              setPanelLayout(nextLayout)
              persistPanelLayout(nextLayout)
            }}
            orientation="horizontal"
          >
            <ResizablePanel
              defaultSize={panelLayout.sessions}
              id="sessions"
              minSize={shellPanelConstraints.sessions.minSize}
            >
              <SessionRail
                activeSessionId={currentSession.summary.id}
                loading={commandState.loading}
                onCreateSession={() => {
                  void actions.createNewSession()
                }}
                onDeleteSession={(sessionId) => {
                  void actions.deleteCurrentOrTargetSession(sessionId)
                }}
                onOpenSession={(sessionId) => {
                  void actions.openSessionById(sessionId)
                }}
                sessions={appState.sessions}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={panelLayout.workbench}
              id="workbench"
              minSize={shellPanelConstraints.workbench.minSize}
            >
              <WorkbenchPane
                activeView={activeView}
                build={currentBuild}
                draftSource={draftSource}
                hasUnsavedChanges={hasUnsavedChanges}
                inspect={currentInspect}
                logs={currentLogs}
                onBuild={() => {
                  void actions.buildCurrentSession()
                }}
                onDraftSourceChange={setDraftSource}
                onInspect={() => {
                  void actions.inspectCurrentSession()
                }}
                onSaveSource={() => {
                  void actions.saveCurrentSource()
                }}
                onValidate={() => {
                  void actions.validateCurrentSource()
                }}
                onViewChange={(view) => {
                  void actions.changeView(view)
                }}
                previewHtml={previewHtml}
                saving={commandState.saving}
                session={currentSession}
                validating={commandState.validating}
                validation={validation}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={panelLayout.shell}
              id="shell"
              minSize={shellPanelConstraints.shell.minSize}
            >
              <ShellPane
                checking={commandState.checking}
                drafting={commandState.drafting}
                messages={filteredMessages}
                messageDraft={messageDraft}
                onDraftChange={setMessageDraft}
                onDraftProposal={() => {
                  void actions.draftProposal()
                }}
                onRuntimeCheck={() => {
                  void actions.checkCurrentRuntime()
                }}
                onSend={() => {
                  void actions.sendMessage()
                }}
                runtimeReport={runtimeReport}
                sending={commandState.sending}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}
