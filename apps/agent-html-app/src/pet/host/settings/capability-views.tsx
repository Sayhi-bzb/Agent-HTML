import type { CodexRuntimeStatus } from "@/app/codex/connection"
import type { CodexSettingsMutation } from "@/app/codex/connection/codex-settings-service"
import { createSkillConfigMutation } from "@/app/codex/connection/codex-settings-service"

import { createAppEnabledMutation, createMcpEnabledMutation } from "./mutations"
import {
  CapabilityNameList,
  CompactMetaRow,
  DetailsBlock,
  SettingsSectionHeader,
} from "./settings-shared"

export function SkillsView({
  queueMutation,
  runtimeStatus,
}: {
  queueMutation: (mutation: CodexSettingsMutation) => void
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <SettingsSectionHeader
        label="Codex skills"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.skills}
      />
      <CapabilityNameList
        emptyLabel="No skills reported"
        items={runtimeStatus.capabilities.skills.items}
        onCreateToggleMutation={createSkillConfigMutation}
        onQueueMutation={queueMutation}
        runtimeStatus={runtimeStatus.status}
      />
      <DetailsBlock>
        <CompactMetaRow
          label="Managed skill"
          value="AgentHTML/.agents/skills/agent-html/SKILL.md"
        />
        <CompactMetaRow
          label="Schema"
          value="AgentHTML/.agents/skills/agent-html/references/prompt-schema.md"
        />
      </DetailsBlock>
    </div>
  )
}

export function McpView({
  queueMutation,
  runtimeStatus,
}: {
  queueMutation: (mutation: CodexSettingsMutation) => void
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <SettingsSectionHeader
        label="MCP servers"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.mcpServers}
      />
      <CapabilityNameList
        emptyLabel="No MCP servers reported"
        items={runtimeStatus.capabilities.mcpServers.items}
        onCreateToggleMutation={createMcpEnabledMutation}
        onQueueMutation={queueMutation}
        runtimeStatus={runtimeStatus.status}
      />
      <DetailsBlock>
        <CompactMetaRow label="Config" value="~/.codex/config.toml" />
        <CompactMetaRow label="Key" value="mcp_servers.<name>.enabled" />
      </DetailsBlock>
    </div>
  )
}

export function PluginsView({
  queueMutation,
  runtimeStatus,
}: {
  queueMutation: (mutation: CodexSettingsMutation) => void
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <SettingsSectionHeader
        label="Codex plugins"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.plugins}
      />
      <CapabilityNameList
        emptyLabel="No plugins reported"
        items={runtimeStatus.capabilities.plugins.items}
        runtimeStatus={runtimeStatus.status}
      />
      <SettingsSectionHeader
        label="Codex apps"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.apps}
      />
      <CapabilityNameList
        emptyLabel="No apps reported"
        items={runtimeStatus.capabilities.apps.items}
        onCreateToggleMutation={createAppEnabledMutation}
        onQueueMutation={queueMutation}
        runtimeStatus={runtimeStatus.status}
      />
      <DetailsBlock>
        <CompactMetaRow label="Workspace" value="AgentHTML/plugins/" />
        <CompactMetaRow label="App key" value="apps.<id>.enabled" />
        <CompactMetaRow label="Plugins" value="read-only" />
      </DetailsBlock>
    </div>
  )
}
