import type { ReactNode } from "react"

import {
  ShellDiagnosticStatusBadge,
  ShellSectionLabel,
  ShellSplitRow,
  ShellSurfaceItem,
} from "@/features/app-shell/components/shell-content"
import type { InspectSnapshot } from "@/lib/types"

type InspectDiagnosticListProps = {
  diagnostics: InspectSnapshot["diagnostics"]
}

export function InspectDiagnosticList({
  diagnostics,
}: InspectDiagnosticListProps) {
  return (
    <div className="app-shell-surface-grid">
      {diagnostics.map((item) => (
        <ShellSurfaceItem key={item.id}>
          <ShellSplitRow>
            <span>{item.message}</span>
            <ShellDiagnosticStatusBadge severity={item.severity} />
          </ShellSplitRow>
        </ShellSurfaceItem>
      ))}
    </div>
  )
}

type InspectConsoleSectionProps = {
  label: ReactNode
  children: ReactNode
}

export function InspectConsoleSection({
  label,
  children,
}: InspectConsoleSectionProps) {
  return (
    <div className="app-shell-console-section">
      <ShellSectionLabel>{label}</ShellSectionLabel>
      <pre className="app-shell-console">{children}</pre>
    </div>
  )
}
