import { useState } from "react"
import { FileCode2Icon } from "lucide-react"

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
import {
  ShellStatusBadge,
  ShellTitleStack,
} from "./features/app-shell/components/shell-content"
import { deriveCommandLocks } from "./features/app-shell/command-locks"
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
  const commandLocks = deriveCommandLocks(commandState)

  return (
    <div className="app-shell">
      <div className="app-shell-frame">
        <header className="app-shell-topbar">
          <div className="app-shell-topbar-row">
            <div className="app-shell-topbar-group">
              <div className="app-shell-panel-icon">
                <FileCode2Icon className="app-shell-inline-icon" />
              </div>
              <ShellTitleStack
                copy={currentSession.summary.directory}
                title="agent-html"
                truncateCopy
              />
            </div>
            <div className="app-shell-status-group">
              <ShellStatusBadge
                label={isTauriRuntime() ? "tauri" : "mock"}
                variant="outline"
              />
              <ShellStatusBadge label={activeView} variant="secondary" />
              {commandState.error ? (
                <ShellStatusBadge label="error" variant="destructive" />
              ) : null}
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
            className="app-shell-fill-layout"
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
                disabled={commandLocks.sessionNavigationLocked}
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
                interactionLocked={commandLocks.workbenchInteractionLocked}
                inspect={currentInspect}
                inspecting={commandState.inspecting}
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
                building={commandState.building}
                previewHtml={previewHtml}
                saving={commandState.saving}
                session={currentSession}
                sourceEditingLocked={commandLocks.sourceEditingLocked}
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
                interactionLocked={commandLocks.shellComposeLocked}
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
                proposalLocked={commandLocks.proposalLocked}
                runtimeCheckLocked={commandLocks.runtimeCheckLocked}
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
