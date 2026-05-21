import { FileCode2Icon } from "lucide-react"

import {
  ShellStatusBadge,
  ShellSectionLabel,
} from "@/features/app-shell/components/shell-content"
import { isTauriRuntime } from "@/lib/tauri"
import type { WorkbenchView } from "@/lib/types"

type TopBarProps = {
  activeView: WorkbenchView
  sessionName: string
  hasError: boolean
}

export function TopBar({
  activeView,
  sessionName,
  hasError,
}: TopBarProps) {
  return (
    <header className="app-shell-topbar">
      <div className="app-shell-topbar-row">
        <div className="app-shell-topbar-group">
          <FileCode2Icon className="app-shell-inline-icon app-shell-brand-icon" />
          <div className="app-shell-topbar-brand">
            <span className="app-shell-topbar-copy">agent-html</span>
            <span className="app-shell-panel-title">review studio</span>
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
          <ShellSectionLabel>{activeView}</ShellSectionLabel>
          {hasError ? <ShellStatusBadge label="error" variant="destructive" /> : null}
        </div>
      </div>
    </header>
  )
}
