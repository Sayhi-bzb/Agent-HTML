import { Separator } from "@/components/ui/separator"
import type {
  InspectSnapshot,
  LogSnapshot,
} from "@/lib/types"

import {
  ShellCardHeader,
  ShellDiagnosticStatusBadge,
  ShellLoadingRow,
  ShellSplitRow,
  ShellSectionLabel,
  ShellStatusBadge,
  ShellSurfaceItem,
  ShellWorkbenchCard,
} from "@/features/app-shell/components/shell-content"

type InspectTabProps = {
  inspect: InspectSnapshot
  logs: LogSnapshot
  inspecting: boolean
}

export function InspectTab({ inspect, logs, inspecting }: InspectTabProps) {
  return (
    <ShellWorkbenchCard
      header={
        <ShellCardHeader
          action={
            <ShellStatusBadge
              label={`${inspect.diagnostics.length} items`}
              variant="outline"
            />
          }
          description={inspect.generatedAt}
          title="Inspect"
        />
      }
    >
      {inspecting ? <ShellLoadingRow>Refreshing inspect snapshot</ShellLoadingRow> : null}
      <div className="app-shell-surface-grid">
        {inspect.diagnostics.map((item) => (
          <ShellSurfaceItem key={item.id}>
            <ShellSplitRow>
              <span>{item.message}</span>
              <ShellDiagnosticStatusBadge severity={item.severity} />
            </ShellSplitRow>
          </ShellSurfaceItem>
        ))}
      </div>
      <Separator />
      <div className="app-shell-surface-grid app-shell-surface-pane">
        <ShellSectionLabel>stdout</ShellSectionLabel>
        <pre className="app-shell-console">
          {logs.stdout || "n/a"}
        </pre>
      </div>
    </ShellWorkbenchCard>
  )
}
