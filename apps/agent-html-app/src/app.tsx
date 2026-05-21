import { useState } from "react"

import { MainLayout } from "./features/app-shell/components/main-layout"
import { TopBar } from "./features/app-shell/components/top-bar"
import { deriveCommandLocks } from "./features/app-shell/command-locks"
import { readStoredPanelLayout } from "./features/app-shell/panel-layout"
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
        <TopBar
          activeView={activeView}
          hasError={Boolean(commandState.error)}
          sessionName={currentSession.summary.name}
          sessionDirectory={currentSession.summary.directory}
        />

        {commandState.error ? (
          <div className="app-shell-error-banner">
            {commandState.error}
          </div>
        ) : null}

        <MainLayout
          onPanelLayoutChange={setPanelLayout}
          panelLayout={panelLayout}
          sessions={
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
          }
          shell={
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
          }
          workbench={
            <WorkbenchPane
              activeView={activeView}
              build={currentBuild}
              building={commandState.building}
              draftSource={draftSource}
              hasUnsavedChanges={hasUnsavedChanges}
              inspect={currentInspect}
              inspecting={commandState.inspecting}
              interactionLocked={commandLocks.workbenchInteractionLocked}
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
              sourceEditingLocked={commandLocks.sourceEditingLocked}
              validating={commandState.validating}
              validation={validation}
            />
          }
        />
      </div>
    </div>
  )
}
