import type { ReactNode } from "react"

import {
  ShellDiagnosticStatusBadge,
  ShellSectionLabel,
  ShellSplitRow,
} from "@/features/app-shell/components/shell-content"
import type { InspectSnapshot } from "@/lib/types"

type InspectDiagnosticListProps = {
  diagnostics: InspectSnapshot["diagnostics"]
}

export function InspectDiagnosticList({
  diagnostics,
}: InspectDiagnosticListProps) {
  const actionable = diagnostics.filter((item) => item.severity !== "info")
  const visibleDiagnostics = actionable.length > 0 ? actionable : diagnostics

  return (
    <div className="app-shell-divider-list">
      {visibleDiagnostics.map((item) => (
        <div className="app-shell-diagnostic-row" key={item.id}>
          <ShellSplitRow align="start" className="w-full">
            <span>{item.message}</span>
            <ShellDiagnosticStatusBadge severity={item.severity} />
          </ShellSplitRow>
        </div>
      ))}
    </div>
  )
}

type InspectConsoleSectionProps = {
  label?: ReactNode
  children: ReactNode
}

export function InspectConsoleSection({
  label,
  children,
}: InspectConsoleSectionProps) {
  return (
    <div className="app-shell-console-section">
      {label ? <ShellSectionLabel>{label}</ShellSectionLabel> : null}
      <pre className="app-shell-console">{children}</pre>
    </div>
  )
}
