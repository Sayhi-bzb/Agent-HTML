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
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md border bg-muted">
                <FileCode2Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">agent-html</p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentSession.summary.directory}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{isTauriRuntime() ? "tauri" : "mock"}</Badge>
              <Badge variant="secondary">{activeView}</Badge>
              {commandState.error ? <Badge variant="destructive">error</Badge> : null}
            </div>
          </div>
        </header>

        {commandState.error ? (
          <div className="border-b px-4 py-2 text-xs text-destructive">
            {commandState.error}
          </div>
        ) : null}

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup
            className="h-full"
            onLayoutChanged={(layout) => {
              const nextLayout = normalizePanelLayout(layout)
              setPanelLayout(nextLayout)
              persistPanelLayout(nextLayout)
            }}
            orientation="horizontal"
          >
            <ResizablePanel defaultSize={panelLayout.sessions} id="sessions" minSize={16}>
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
            <ResizablePanel defaultSize={panelLayout.workbench} id="workbench" minSize={38}>
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
                validating={false}
                validation={validation}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={panelLayout.shell} id="shell" minSize={22}>
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
