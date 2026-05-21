import {
  AppWindowIcon,
  MinusIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PlusIcon,
  SquareIcon,
  XIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { ShellIconButton } from "@/features/app-shell/components/shell-content"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  closeWindow,
  isTauriRuntime,
  minimizeWindow,
  toggleMaximizeWindow,
} from "@/lib/tauri"
import type { SessionSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

type TopBarProps = {
  activeSessionId: string
  sessionTabs: SessionSummary[]
  interactionLocked: boolean
  leftPanelVisible: boolean
  rightPanelVisible: boolean
  onCreateSession: () => void
  onOpenSession: (sessionId: string) => void
  onCloseSession: (sessionId: string) => void
  onToggleLeftPanel: () => void
  onToggleRightPanel: () => void
}

export function TopBar({
  activeSessionId,
  sessionTabs,
  interactionLocked,
  leftPanelVisible,
  rightPanelVisible,
  onCreateSession,
  onOpenSession,
  onCloseSession,
  onToggleLeftPanel,
  onToggleRightPanel,
}: TopBarProps) {
  const desktopRuntime = isTauriRuntime()

  return (
    <header className="app-shell-topbar app-shell-titlebar">
      <div
        className="app-shell-titlebar-row"
        data-tauri-drag-region={desktopRuntime ? "" : undefined}
      >
        <div className="app-shell-titlebar-side">
          <ShellIconButton
            ariaLabel={leftPanelVisible ? "Hide sessions panel" : "Show sessions panel"}
            className={cn(leftPanelVisible && "text-shell-text-primary")}
            disabled={interactionLocked}
            onClick={onToggleLeftPanel}
            tooltip={leftPanelVisible ? "Hide sessions" : "Show sessions"}
          >
            <PanelLeftIcon />
          </ShellIconButton>
          <ShellIconButton
            ariaLabel={rightPanelVisible ? "Hide review panel" : "Show review panel"}
            className={cn(rightPanelVisible && "text-shell-text-primary")}
            disabled={interactionLocked}
            onClick={onToggleRightPanel}
            tooltip={rightPanelVisible ? "Hide review" : "Show review"}
          >
            <PanelRightIcon />
          </ShellIconButton>
        </div>

        <div className="app-shell-tabstrip" data-tauri-drag-region={desktopRuntime ? "" : undefined}>
          <div className="app-shell-tabstrip-brand">
            <AppWindowIcon className="app-shell-inline-icon" />
            <span className="app-shell-topbar-copy">agent-html</span>
          </div>

          <Tabs
            className="app-shell-session-tabs"
            onValueChange={onOpenSession}
            value={activeSessionId}
          >
            <TabsList className="app-shell-session-tabs-list" variant="line">
              {sessionTabs.map((session) => (
                <TabsTrigger
                  className="app-shell-session-tab"
                  disabled={interactionLocked}
                  key={session.id}
                  value={session.id}
                >
                  <span className="app-shell-session-tab-label">{session.name}</span>
                  <button
                    aria-label={`Close ${session.name}`}
                    className="app-shell-session-tab-close"
                    disabled={interactionLocked || sessionTabs.length <= 1}
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      onCloseSession(session.id)
                    }}
                    type="button"
                  >
                    <XIcon className="app-shell-inline-icon" />
                  </button>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ShellIconButton
            ariaLabel="Create session"
            disabled={interactionLocked}
            onClick={onCreateSession}
            tooltip="New session"
          >
            <PlusIcon />
          </ShellIconButton>
        </div>

        <div className="app-shell-titlebar-side app-shell-titlebar-side-right">
          {desktopRuntime ? (
            <div className="app-shell-window-controls">
              <Button
                aria-label="Minimize window"
                className="app-shell-window-control"
                onClick={() => {
                  void minimizeWindow()
                }}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <MinusIcon />
              </Button>
              <Button
                aria-label="Toggle maximize window"
                className="app-shell-window-control"
                onClick={() => {
                  void toggleMaximizeWindow()
                }}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <SquareIcon />
              </Button>
              <Button
                aria-label="Close window"
                className="app-shell-window-control app-shell-window-control-danger"
                onClick={() => {
                  void closeWindow()
                }}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <XIcon />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
