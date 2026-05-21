import {
  FileCode2Icon,
  MonitorIcon,
  TriangleAlertIcon,
} from "lucide-react"

import {
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
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
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="app-shell-topbar-brand">
                <FileCode2Icon className="app-shell-inline-icon app-shell-brand-icon" />
                <span className="app-shell-topbar-copy">agent-html</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">review studio</TooltipContent>
          </Tooltip>
        </div>
        <div className="app-shell-topbar-center">
          <p className="app-shell-session-title">{sessionName}</p>
        </div>
        <div className="app-shell-status-group">
          <ShellStatusBadge label={activeView} variant="outline" />
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                aria-label={isTauriRuntime() ? "Desktop runtime" : "Local runtime"}
                className="app-shell-topbar-meta-icon"
              >
                <MonitorIcon className="app-shell-inline-icon" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isTauriRuntime() ? "desktop runtime" : "local runtime"}
            </TooltipContent>
          </Tooltip>
          {hasError ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  aria-label="Error"
                  className="app-shell-topbar-meta-icon app-shell-topbar-meta-icon-error"
                >
                  <TriangleAlertIcon className="app-shell-inline-icon" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">error</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>
    </header>
  )
}
