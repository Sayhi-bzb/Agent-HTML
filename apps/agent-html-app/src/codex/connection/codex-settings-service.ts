import { readObject, readScalarAsString, readString } from "./object-readers"
import type { WorkspaceRootStatus } from "./types"

export type CodexSettingsRequest = (
  method: string,
  params: unknown
) => Promise<unknown>

export type CodexSettingsItem = {
  enabled?: boolean
  id?: string
  installed?: boolean
  name: string
  path?: string
  source?: string
  status?: string
}

export type CodexSettingsMutation = {
  description: string
  method: string
  params: unknown
  title: string
}

export function resolveRootAgentsPath(
  workspaceRootStatus: WorkspaceRootStatus | null
) {
  const rootPath = workspaceRootStatus?.rootPath
  if (!rootPath) {
    return null
  }

  const separator = rootPath.includes("\\") ? "\\" : "/"
  return `${rootPath.replace(/[\\/]$/, "")}${separator}AGENTS.md`
}

export function readTextFileContent(value: unknown) {
  if (typeof value === "string") {
    return value
  }

  const result = readObject(value)
  return (
    readString(result, ["content"]) ??
    readString(result, ["text"]) ??
    readString(result, ["data"]) ??
    ""
  )
}

export async function readCodexTextFile(
  request: CodexSettingsRequest,
  path: string
) {
  return readTextFileContent(await request("fs/readFile", { path }))
}

export function createWriteCodexTextFileMutation(
  path: string,
  content: string
): CodexSettingsMutation {
  return {
    description: `Write ${path} through the Codex app-server filesystem API.`,
    method: "fs/writeFile",
    params: { content, path },
    title: "Save AGENTS.md",
  }
}

export function createMcpReloadMutation(): CodexSettingsMutation {
  return {
    description:
      "Reload MCP server configuration from disk and refresh loaded Codex threads.",
    method: "config/mcpServer/reload",
    params: {},
    title: "Reload MCP servers",
  }
}

export function createMcpOauthLoginMutation(
  name: string
): CodexSettingsMutation {
  return {
    description: `Start OAuth login for MCP server ${name}.`,
    method: "mcpServer/oauth/login",
    params: { name },
    title: "Start MCP OAuth login",
  }
}

export function createConfigValueWriteMutation({
  description,
  keyPath,
  title,
  value,
}: {
  description: string
  keyPath: string
  title: string
  value: unknown
}): CodexSettingsMutation {
  return {
    description,
    method: "config/value/write",
    params: {
      keyPath,
      mergeStrategy: "replace",
      value,
    },
    title,
  }
}

export function createSkillConfigMutation(
  skill: CodexSettingsItem,
  enabled: boolean
): CodexSettingsMutation | null {
  if (!skill.path) {
    return null
  }

  return {
    description: `${enabled ? "Enable" : "Disable"} skill ${skill.name}.`,
    method: "skills/config/write",
    params: {
      enabled,
      path: skill.path,
    },
    title: `${enabled ? "Enable" : "Disable"} skill`,
  }
}

export function createPluginInstallMutation(
  plugin: CodexSettingsItem
): CodexSettingsMutation | null {
  if (!plugin.path && !plugin.id) {
    return null
  }

  return {
    description: `Install plugin ${plugin.name}.`,
    method: "plugin/install",
    params: plugin.path
      ? { marketplacePath: plugin.path }
      : { remoteMarketplaceName: plugin.source, name: plugin.id },
    title: "Install plugin",
  }
}

export function createPluginUninstallMutation(
  plugin: CodexSettingsItem
): CodexSettingsMutation | null {
  if (!plugin.id && !plugin.name) {
    return null
  }

  return {
    description: `Uninstall plugin ${plugin.name}.`,
    method: "plugin/uninstall",
    params: { name: plugin.id ?? plugin.name },
    title: "Uninstall plugin",
  }
}

export function readCodexSettingsItems(value: unknown): CodexSettingsItem[] {
  return readItemsFromValue(value)
}

function readItemsFromValue(
  value: unknown,
  inheritedSource?: string
): CodexSettingsItem[] {
  if (typeof value === "string") {
    return [{ name: value, source: inheritedSource }]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => readItemsFromValue(item, inheritedSource))
  }

  const item = readObject(value)
  if (!item) {
    return []
  }

  const source = readItemSource(item) ?? inheritedSource
  const ownItem = readSettingsItem(item, source)
  const nestedItems = [
    "apps",
    "items",
    "plugins",
    "servers",
    "skills",
    "tools",
  ].flatMap((key) => {
    const nested = item[key]
    return Array.isArray(nested) ? readItemsFromValue(nested, source) : []
  })

  return ownItem ? [ownItem, ...nestedItems] : nestedItems
}

function readSettingsItem(
  item: Record<string, unknown>,
  source?: string
): CodexSettingsItem | null {
  const name =
    readString(item, ["name"]) ??
    readString(item, ["title"]) ??
    readScalarAsString(item, ["id"]) ??
    readString(item, ["command"])

  if (!name) {
    return null
  }

  return {
    enabled: readBoolean(item, ["enabled"]),
    id:
      readScalarAsString(item, ["id"]) ??
      readScalarAsString(item, ["name"]) ??
      readScalarAsString(item, ["slug"]),
    installed: readBoolean(item, ["installed"]),
    name,
    path:
      readScalarAsString(item, ["path"]) ??
      readScalarAsString(item, ["marketplacePath"]) ??
      readScalarAsString(item, ["sourcePath"]),
    source,
    status:
      readScalarAsString(item, ["status"]) ??
      readScalarAsString(item, ["state"]) ??
      readScalarAsString(item, ["authStatus"]) ??
      readScalarAsString(item, ["enabled"]) ??
      readScalarAsString(item, ["ok"]),
  }
}

function readBoolean(value: unknown, keys: string[]) {
  let current = value
  for (const key of keys) {
    const object = readObject(current)
    if (!object) {
      return undefined
    }
    current = object[key]
  }

  return typeof current === "boolean" ? current : undefined
}

function readItemSource(item: Record<string, unknown>) {
  for (const key of ["cwd", "root", "source", "sourcePath"]) {
    const source = readScalarAsString(item, [key])
    if (source) {
      return source
    }
  }

  const source = readObject(item.source)
  if (!source) {
    return undefined
  }

  return (
    readScalarAsString(source, ["path"]) ??
    readScalarAsString(source, ["url"]) ??
    readScalarAsString(source, ["type"])
  )
}
