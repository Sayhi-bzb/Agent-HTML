import type { CodexRuntimeStatus } from "@/app/codex/connection"

import { SettingsSectionHeader } from "./settings-shared"

export function RuntimeView({
  codexCommand,
  connectionStatus,
  cwd,
  runtimeStatus,
}: {
  codexCommand: string
  connectionStatus: string
  cwd: string
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <SettingsSectionHeader
        label="Runtime config"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.config}
      />
      <div className="grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2">
        <RuntimeField label="Connection" value={connectionStatus} />
        <RuntimeField label="Command" value={codexCommand} />
        <RuntimeField label="Cwd" value={cwd} />
        <RuntimeField label="Model" value={runtimeStatus.config.model ?? "unknown"} />
        <RuntimeField
          label="Provider"
          value={runtimeStatus.config.modelProvider ?? "unknown"}
        />
        <RuntimeField
          label="Sandbox"
          value={
            runtimeStatus.config.sandboxMode ??
            runtimeStatus.config.sandboxModeDiagnostic ??
            "unknown"
          }
        />
        <RuntimeField
          label="Approvals"
          value={
            runtimeStatus.config.approvalPolicy ??
            runtimeStatus.config.approvalPolicyDiagnostic ??
            "unknown"
          }
        />
      </div>
    </div>
  )
}

export function RuntimeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
      <span data-selection="none" className="text-muted-foreground">
        {label}
      </span>
      <span data-cursor="text" data-selection="text" className="break-all">
        {value}
      </span>
    </div>
  )
}
