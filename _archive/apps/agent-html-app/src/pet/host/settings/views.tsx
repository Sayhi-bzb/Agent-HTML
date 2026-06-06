import type { CodexSettingsMutation } from "@/app/codex/connection/codex-settings-service"

import { AgentsMdView } from "./agents-md-view"
import { McpView, PluginsView, SkillsView } from "./capability-views"
import { ConnectionView } from "./connection-view"
import { RuntimeView } from "./runtime-view"
import type { PetSettingsDispatch, PetSettingsSurfaceSnapshot } from "./types"

export function SettingsViewContent({
  dispatch,
  snapshot,
}: {
  dispatch: PetSettingsDispatch
  snapshot: PetSettingsSurfaceSnapshot
}) {
  const { activeView, agents, codex } = snapshot
  const runtimeStatus = codex.runtimeStatus
  const queueMutation = (mutation: CodexSettingsMutation) =>
    dispatch({ mutation, type: "queue-mutation" })

  if (activeView === "AGENTS.md") {
    return (
      <AgentsMdView
        draft={agents.draft}
        error={agents.error}
        isDirty={agents.isDirty}
        isLoading={agents.isLoading}
        isSaving={agents.isSaving}
        loadInstructions={() => {
          dispatch({ type: "reload-agents-instructions" })
        }}
        path={agents.path}
        saveInstructions={() => {
          dispatch({ type: "save-agents-instructions" })
        }}
        source={agents.source}
        setDraft={(draft) => {
          dispatch({ draft, type: "set-agents-draft" })
        }}
        status={agents.status}
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
        codexCommand={codex.health?.codexCommand ?? "unknown"}
        connectionStatus={codex.status}
        cwd={codex.health?.cwd ?? "unknown"}
        runtimeStatus={runtimeStatus}
      />
    )
  }

  return (
    <ConnectionView
      canManageHost={codex.canManageHost}
      codexCommand={codex.health?.codexCommand ?? "unknown"}
      codexConnectionStatus={codex.status}
      connectionStatus={codex.status}
      cwd={codex.health?.cwd ?? "unknown"}
      draftCodexCommand={codex.draftSettings.codexCommand}
      draftWorkspaceRootPath={codex.draftWorkspaceRootPath}
      healthAppServerRunning={codex.health?.appServerRunning}
      isCodexBusy={codex.isBusy}
      isCodexLoaded={codex.isLoaded}
      lastError={codex.lastError}
      onDraftCodexCommandChange={(command) => {
        dispatch({ command, type: "set-codex-command" })
      }}
      onDraftWorkspaceRootPathChange={(path) => {
        dispatch({ path, type: "set-workspace-root-path" })
      }}
      onRestart={() => dispatch({ type: "restart-codex" })}
      onSaveCodexSettings={() => dispatch({ type: "save-codex-settings" })}
      onSaveWorkspaceRoot={() => dispatch({ type: "save-workspace-root" })}
      onStop={() => dispatch({ type: "stop-codex" })}
      onTestConnection={() => dispatch({ type: "test-codex" })}
      workspaceRootNotice={codex.workspaceRootNotice}
      workspaceRootStatus={codex.workspaceRootStatus}
    />
  )
}
