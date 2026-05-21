import { FileCode2Icon } from "lucide-react"

import {
  ShellStatusBadge,
  ShellTitleStack,
} from "@/features/app-shell/components/shell-content"
import { isTauriRuntime } from "@/lib/tauri"
import type { WorkbenchView } from "@/lib/types"

type TopBarProps = {
  activeView: WorkbenchView
  sessionDirectory: string
  hasError: boolean
}

export function TopBar({
  activeView,
  sessionDirectory,
  hasError,
}: TopBarProps) {
  return (
    <header className="app-shell-topbar">
      <div className="app-shell-topbar-row">
        <div className="app-shell-topbar-group">
          <div className="app-shell-panel-icon">
            <FileCode2Icon className="app-shell-inline-icon" />
          </div>
          <ShellTitleStack copy={sessionDirectory} title="agent-html" truncateCopy />
        </div>
        <div className="app-shell-status-group">
          <ShellStatusBadge
            label={isTauriRuntime() ? "tauri" : "mock"}
            variant="outline"
          />
          <ShellStatusBadge label={activeView} variant="secondary" />
          {hasError ? <ShellStatusBadge label="error" variant="destructive" /> : null}
        </div>
      </div>
    </header>
  )
}
