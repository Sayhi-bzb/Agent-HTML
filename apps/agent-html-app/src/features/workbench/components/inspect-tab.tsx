import { Separator } from "@/components/ui/separator"
import type {
  InspectSnapshot,
  LogSnapshot,
} from "@/lib/types"

import { ShellLoadingRow } from "@/features/app-shell/components/shell-content"
import { InspectHeader } from "./inspect-header"
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
  const stdout = logs.stdout?.trim()
  const stderr = logs.stderr?.trim()
  const hasLogs = Boolean(stdout || stderr)

  return (
    <WorkbenchCard header={<InspectHeader inspect={inspect} />}>
      {inspecting ? <ShellLoadingRow>Scan</ShellLoadingRow> : null}
      <InspectDiagnosticList diagnostics={inspect.diagnostics} />
      {hasLogs ? <Separator /> : null}
      {stdout ? <InspectConsoleSection>{stdout}</InspectConsoleSection> : null}
      {stderr ? <InspectConsoleSection label="issue">{stderr}</InspectConsoleSection> : null}
    </WorkbenchCard>
  )
}
