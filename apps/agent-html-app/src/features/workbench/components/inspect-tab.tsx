import { Separator } from "@/components/ui/separator"
import type {
  InspectSnapshot,
  LogSnapshot,
} from "@/lib/types"

import {
  ShellCardHeader,
  ShellLoadingRow,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"
import {
  InspectConsoleSection,
  InspectDiagnosticList,
} from "./inspect-diagnostics"
import { WorkbenchCard } from "./workbench-card"

type InspectTabProps = {
  inspect: InspectSnapshot
  logs: LogSnapshot
  inspecting: boolean
}

export function InspectTab({ inspect, logs, inspecting }: InspectTabProps) {
  return (
    <WorkbenchCard
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
      <InspectDiagnosticList diagnostics={inspect.diagnostics} />
      <Separator />
      <InspectConsoleSection label="stdout">{logs.stdout || "n/a"}</InspectConsoleSection>
    </WorkbenchCard>
  )
}
