import type { CodexRuntimeStatus } from "@/app/codex/connection"
import type { WorkspaceRootStatus } from "@/app/codex/connection/types"
import type { CodexSettingsMutation } from "@/app/codex/connection/codex-settings-service"
import type { AgentsInstructionsSource } from "@/app/pet/host/agents-instructions-loader"

import { AgentsMdView } from "./agents-md-view"
import { McpView, PluginsView, SkillsView } from "./capability-views"
import { ConnectionView } from "./connection-view"
import { RuntimeView } from "./runtime-view"
import type { SettingsView } from "./types"

export function SettingsViewContent({
  activeView,
  agentsPath,
  canManageHost,
  codexCommand,
  codexConnectionStatus,
  connectionStatus,
  cwd,
  draft,
  draftCodexCommand,
  draftWorkspaceRootPath,
  error,
  healthAppServerRunning,
  isCodexBusy,
  isCodexLoaded,
  isDirty,
  isLoading,
  isSaving,
  lastError,
  loadInstructions,
  onDraftCodexCommandChange,
  onDraftWorkspaceRootPathChange,
  onRestart,
  onSaveCodexSettings,
  onSaveWorkspaceRoot,
  onStop,
  onTestConnection,
  runtimeStatus,
  saveInstructions,
  setDraft,
  source,
  status,
  queueMutation,
  workspaceRootNotice,
  workspaceRootStatus,
}: {
  activeView: SettingsView
  agentsPath: string | null
  canManageHost: boolean
  codexCommand: string
  codexConnectionStatus: string
  connectionStatus: string
  cwd: string
  draft: string
  draftCodexCommand: string
  draftWorkspaceRootPath: string
  error: string | null
  healthAppServerRunning?: boolean
  isCodexBusy: boolean
  isCodexLoaded: boolean
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  lastError?: string | null
  loadInstructions: () => Promise<void> | void
  onDraftCodexCommandChange: (value: string) => void
  onDraftWorkspaceRootPathChange: (value: string) => void
  onRestart: () => void
  onSaveCodexSettings: () => void
  onSaveWorkspaceRoot: () => void
  onStop: () => void
  onTestConnection: () => void
  runtimeStatus: CodexRuntimeStatus
  saveInstructions: () => void
  setDraft: (draft: string) => void
  source: AgentsInstructionsSource | null
  status: "idle" | "saved"
  queueMutation: (mutation: CodexSettingsMutation) => void
  workspaceRootNotice?: string | null
  workspaceRootStatus: WorkspaceRootStatus | null
}) {
  if (activeView === "AGENTS.md") {
    return (
      <AgentsMdView
        draft={draft}
        error={error}
        isDirty={isDirty}
        isLoading={isLoading}
        isSaving={isSaving}
        loadInstructions={loadInstructions}
        path={agentsPath}
        saveInstructions={saveInstructions}
        source={source}
        setDraft={setDraft}
        status={status}
      />
    )
  }

  if (activeView === "MCP") {
    return <McpView queueMutation={queueMutation} runtimeStatus={runtimeStatus} />
  }

  if (activeView === "Skills") {
    return <SkillsView queueMutation={queueMutation} runtimeStatus={runtimeStatus} />
  }

  if (activeView === "Plugins") {
    return <PluginsView queueMutation={queueMutation} runtimeStatus={runtimeStatus} />
  }

  if (activeView === "Runtime") {
    return (
      <RuntimeView
        codexCommand={codexCommand}
        connectionStatus={connectionStatus}
        cwd={cwd}
        runtimeStatus={runtimeStatus}
      />
    )
  }

  return (
    <ConnectionView
      canManageHost={canManageHost}
      codexCommand={codexCommand}
      codexConnectionStatus={codexConnectionStatus}
      connectionStatus={connectionStatus}
      cwd={cwd}
      draftCodexCommand={draftCodexCommand}
      draftWorkspaceRootPath={draftWorkspaceRootPath}
      healthAppServerRunning={healthAppServerRunning}
      isCodexBusy={isCodexBusy}
      isCodexLoaded={isCodexLoaded}
      lastError={lastError}
      onDraftCodexCommandChange={onDraftCodexCommandChange}
      onDraftWorkspaceRootPathChange={onDraftWorkspaceRootPathChange}
      onRestart={onRestart}
      onSaveCodexSettings={onSaveCodexSettings}
      onSaveWorkspaceRoot={onSaveWorkspaceRoot}
      onStop={onStop}
      onTestConnection={onTestConnection}
      workspaceRootNotice={workspaceRootNotice}
      workspaceRootStatus={workspaceRootStatus}
    />
  )
}
