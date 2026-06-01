import type { CodexRuntimeCapabilityItem } from "@/app/codex/connection/types"
import { createConfigValueWriteMutation } from "@/app/codex/connection/codex-settings-service"

export function createMcpEnabledMutation(
  item: CodexRuntimeCapabilityItem,
  enabled: boolean
) {
  const id = item.id ?? item.name
  if (!isConfigPathSegment(id)) {
    return null
  }

  return createConfigValueWriteMutation({
    description: `${enabled ? "Enable" : "Disable"} MCP server ${item.name}.`,
    keyPath: `mcp_servers.${id}.enabled`,
    title: `${enabled ? "Enable" : "Disable"} MCP server`,
    value: enabled,
  })
}

export function createAppEnabledMutation(
  item: CodexRuntimeCapabilityItem,
  enabled: boolean
) {
  if (!isConfigPathSegment(item.id)) {
    return null
  }

  return createConfigValueWriteMutation({
    description: `${enabled ? "Enable" : "Disable"} app ${item.name}.`,
    keyPath: `apps.${item.id}.enabled`,
    title: `${enabled ? "Enable" : "Disable"} app`,
    value: enabled,
  })
}

function isConfigPathSegment(value: string | undefined) {
  return Boolean(value && !value.includes("."))
}