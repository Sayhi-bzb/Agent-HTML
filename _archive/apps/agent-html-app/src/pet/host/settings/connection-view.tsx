import type { WorkspaceRootStatus } from "@/app/codex/connection/types"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import { Input } from "@/app/shared/ui/input"
import { Label } from "@/app/shared/ui/label"
import { SettingsInfoPanel } from "@/app/shell/settings-surface"

import { CompactMetaRow, DetailsBlock } from "./settings-shared"
import { RuntimeField } from "./runtime-view"
import { isNonBlockingCodexNoise } from "./utils"

export function ConnectionView({
  canManageHost,
  codexCommand,
  codexConnectionStatus,
  connectionStatus,
  cwd,
  draftCodexCommand,
  draftWorkspaceRootPath,
  healthAppServerRunning,
  isCodexBusy,
  isCodexLoaded,
  lastError,
  onDraftCodexCommandChange,
  onDraftWorkspaceRootPathChange,
  onRestart,
  onSaveCodexSettings,
  onSaveWorkspaceRoot,
  onStop,
  onTestConnection,
  workspaceRootNotice,
  workspaceRootStatus,
}: {
  canManageHost: boolean
  codexCommand: string
  codexConnectionStatus: string
  connectionStatus: string
  cwd: string
  draftCodexCommand: string
  draftWorkspaceRootPath: string
  healthAppServerRunning?: boolean
  isCodexBusy: boolean
  isCodexLoaded: boolean
  lastError?: string | null
  onDraftCodexCommandChange: (value: string) => void
  onDraftWorkspaceRootPathChange: (value: string) => void
  onRestart: () => void
  onSaveCodexSettings: () => void
  onSaveWorkspaceRoot: () => void
  onStop: () => void
  onTestConnection: () => void
  workspaceRootNotice?: string | null
  workspaceRootStatus: WorkspaceRootStatus | null
}) {
  const hiddenDiagnostic = isNonBlockingCodexNoise(lastError) ? lastError : null
  const visibleError = hiddenDiagnostic ? null : lastError

  return (
    <div className="grid gap-4">
      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium">Status</h3>
          <Badge
            variant={
              codexConnectionStatus === "connected"
                ? "default"
                : codexConnectionStatus === "error"
                  ? "destructive"
                  : "outline"
            }
          >
            {codexConnectionStatus}
          </Badge>
        </div>
        {visibleError ? (
          <SettingsInfoPanel variant="destructive">{visibleError}</SettingsInfoPanel>
        ) : null}
        {hiddenDiagnostic ? (
          <DetailsBlock label="Diagnostics">
            <CompactMetaRow label="Hidden" value={hiddenDiagnostic} />
          </DetailsBlock>
        ) : null}
        {!canManageHost ? (
          <SettingsInfoPanel>
            Desktop runtime required to manage Codex.
          </SettingsInfoPanel>
        ) : null}
      </section>

      <section className="grid gap-3 border-t border-border/60 pt-3">
        <h3 className="text-sm font-medium" data-selection="none">
          Workspace
        </h3>
        <div className="grid gap-2">
          <Label htmlFor="pet-settings-workspace-root">
            Custom workspace root
          </Label>
          <Input
            id="pet-settings-workspace-root"
            onChange={(event) =>
              onDraftWorkspaceRootPathChange(event.target.value)
            }
            placeholder={workspaceRootStatus?.defaultRootPath ?? ""}
            value={draftWorkspaceRootPath}
          />
        </div>
        <DetailsBlock>
          <CompactMetaRow
            label="Opened root"
            value={workspaceRootStatus?.rootPath ?? "unknown"}
          />
          <CompactMetaRow
            label="Next startup"
            value={workspaceRootStatus?.pendingRootPath ?? "unknown"}
          />
          <CompactMetaRow
            label="Default root"
            value={workspaceRootStatus?.defaultRootPath ?? "unknown"}
          />
        </DetailsBlock>
        {workspaceRootNotice ? (
          <SettingsInfoPanel>{workspaceRootNotice}</SettingsInfoPanel>
        ) : null}
        <div>
          <Button
            disabled={!canManageHost}
            onClick={onSaveWorkspaceRoot}
            size="sm"
            type="button"
            variant="outline"
          >
            Save workspace root
          </Button>
        </div>
      </section>

      <section className="grid gap-3 border-t border-border/60 pt-3">
        <h3 className="text-sm font-medium" data-selection="none">
          Host
        </h3>
        <div className="grid gap-2">
          <Label htmlFor="pet-settings-codex-command">Codex command</Label>
          <Input
            id="pet-settings-codex-command"
            onChange={(event) => onDraftCodexCommandChange(event.target.value)}
            value={draftCodexCommand}
          />
        </div>
        <div className="grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2">
          <RuntimeField label="Command" value={codexCommand} />
          <RuntimeField label="Cwd" value={cwd} />
          <RuntimeField
            label="App server"
            value={healthAppServerRunning ? "running" : "off"}
          />
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onSaveCodexSettings} size="sm" type="button" variant="outline">
            Save
          </Button>
          <Button
            disabled={isCodexBusy}
            onClick={onTestConnection}
            size="sm"
            type="button"
            variant="outline"
          >
            Test connection
          </Button>
          <Button
            disabled={
              isCodexBusy || !isCodexLoaded || connectionStatus === "disconnected"
            }
            onClick={onStop}
            size="sm"
            type="button"
            variant="outline"
          >
            Stop
          </Button>
          <Button
            disabled={isCodexBusy || !isCodexLoaded}
            onClick={onRestart}
            size="sm"
            type="button"
          >
            Restart
          </Button>
        </div>
      </section>
    </div>
  )
}
