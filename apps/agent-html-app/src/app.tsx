import { useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip"
import { MainLayout } from "./features/app-shell/components/main-layout"
import { ShellStatusBadge } from "./features/app-shell/components/shell-content"
import { TopBar } from "./features/app-shell/components/top-bar"
import { deriveCommandLocks } from "./features/app-shell/command-locks"
import {
  persistShellChromeState,
  readStoredPanelLayout,
  readStoredShellChromeState,
} from "./features/app-shell/panel-layout"
import type {
  PanelLayoutState,
  ShellChromeState,
} from "./features/app-shell/types"
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
    validation,
    commandState,
    currentSession,
    currentBuild,
    currentInspect,
    currentLogs,
    hasUnsavedChanges,
    openSessionTabs,
    setDraftSource,
    actions,
  } = useWorkbenchApp()
  const [panelLayout, setPanelLayout] = useState<PanelLayoutState>(
    readStoredPanelLayout,
  )
  const [shellChrome, setShellChrome] = useState<ShellChromeState>(
    readStoredShellChromeState,
  )
  const commandLocks = deriveCommandLocks(commandState)

  function updateShellChrome(
    mutate: (current: ShellChromeState) => ShellChromeState,
  ): void {
    setShellChrome((current) => {
      const next = mutate(current)
      persistShellChromeState(next)
      return next
    })
  }

  return (
    <div className="app-shell">
      <div className="app-shell-frame">
        <TopBar
          activeSessionId={currentSession.id}
          interactionLocked={commandLocks.sessionNavigationLocked}
          leftPanelVisible={shellChrome.leftPanelVisible}
          onCloseSession={(sessionId) => {
            void actions.closeSessionTab(sessionId)
          }}
          onCreateSession={() => {
            void actions.createNewSession()
          }}
          onOpenSession={(sessionId) => {
            void actions.openSessionById(sessionId)
          }}
          onToggleLeftPanel={() => {
            updateShellChrome((current) => ({
              ...current,
              leftPanelVisible: !current.leftPanelVisible,
            }))
          }}
          onToggleRightPanel={() => {
            updateShellChrome((current) => ({
              ...current,
              rightPanelVisible: !current.rightPanelVisible,
            }))
          }}
          rightPanelVisible={shellChrome.rightPanelVisible}
          sessionTabs={openSessionTabs}
        />

        {commandState.error ? (
          <div className="app-shell-error-banner">
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <ShellStatusBadge label="issue" variant="destructive" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">{commandState.error}</TooltipContent>
            </Tooltip>
          </div>
        ) : null}

        <MainLayout
          onPanelLayoutChange={setPanelLayout}
          panelLayout={panelLayout}
          shellChrome={shellChrome}
          sessions={
            <SessionRail
              activeSessionId={currentSession.id}
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
              onRenameSession={(sessionId, name) => {
                void actions.renameSessionById(sessionId, name)
              }}
              sessions={appState.sessions}
            />
          }
          shell={
            <ShellPane />
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
              onDraftSourceChange={setDraftSource}
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
