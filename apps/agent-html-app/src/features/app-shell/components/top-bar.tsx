import { FileCode2Icon } from "lucide-react"

import {
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { isTauriRuntime } from "@/lib/tauri"
import type { WorkbenchView } from "@/lib/types"

type TopBarProps = {
  activeView: WorkbenchView
  sessionName: string
  sessionDirectory: string
  hasError: boolean
}

export function TopBar({
  activeView,
  sessionName,
  sessionDirectory,
  hasError,
}: TopBarProps) {
  const pathParts = sessionDirectory.split("/")
  const workspaceLabel = pathParts[pathParts.length - 2] ?? sessionDirectory

  return (
    <header className="app-shell-topbar">
      <div className="app-shell-topbar-row">
        <div className="app-shell-topbar-group">
          <div className="app-shell-panel-icon">
            <FileCode2Icon className="app-shell-inline-icon" />
          </div>
          <div className="app-shell-topbar-brand">
            <span className="app-shell-topbar-copy">agent-html</span>
            <span className="app-shell-panel-title">{workspaceLabel}</span>
          </div>
        </div>
        <div className="app-shell-topbar-center">
          <p className="app-shell-session-title">{sessionName}</p>
        </div>
        <div className="app-shell-status-group">
          <ShellStatusBadge
            label={isTauriRuntime() ? "desktop" : "local"}
            variant="outline"
          />
          <ShellStatusBadge label={activeView} variant="secondary" />
          {hasError ? <ShellStatusBadge label="error" variant="destructive" /> : null}
        </div>
      </div>
    </header>
  )
}
