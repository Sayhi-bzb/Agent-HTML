import type {
  CodexRuntimeCapability,
  CodexRuntimeCapabilityItem,
  CodexRuntimeStatus,
  CodexThreadSummary,
} from "./types"
import { readObject, readScalarAsString, readString } from "./object-readers"

const runtimeSourceKeys = [
  "cwd",
  "path",
  "source",
  "sourcePath",
  "root",
  "marketplacePath",
] as const

export function readThreadId(value: unknown): string | null {
  const result = readObject(value)
  const thread = readObject(result?.thread)
  return (
    (typeof thread?.id === "string" && thread.id) ||
    (typeof result?.threadId === "string" && result.threadId) ||
    (typeof result?.id === "string" && result.id) ||
    null
  )
}

export function readTurnId(value: unknown): string | null {
  const result = readObject(value)
  const turn = readObject(result?.turn)
  return typeof turn?.id === "string" ? turn.id : null
}

export function readThreads(value: unknown): CodexThreadSummary[] {
  const result = readObject(value)
  const rawThreads =
    (Array.isArray(result?.data) && result.data) ||
    (Array.isArray(result?.threads) && result.threads) ||
    (Array.isArray(result?.items) && result.items) ||
    (Array.isArray(value) && value) ||
    []

  return rawThreads
    .map<CodexThreadSummary | null>((rawThread) => {
      const thread = readObject(rawThread)
      const id = typeof thread?.id === "string" ? thread.id : null
      if (!id) {
        return null
      }

      return {
        createdAt:
          readScalarAsString(thread, ["createdAt"]) ??
          readScalarAsString(thread, ["created_at"]) ??
          readScalarAsString(thread, ["created"]),
        id,
        name:
          readString(thread, ["name"]) ??
          readString(thread, ["title"]) ??
          null,
        status: readString(thread, ["status"]) ?? null,
        updatedAt:
          readScalarAsString(thread, ["updatedAt"]) ??
          readScalarAsString(thread, ["updated_at"]) ??
          readScalarAsString(thread, ["lastUpdatedAt"]),
      }
    })
    .filter((thread): thread is CodexThreadSummary => thread !== null)
}

export function countItems(value: unknown): number | undefined {
  return readRuntimeItems(value).length
}

export function countCapabilityItems(
  capability: CodexRuntimeCapability,
  value: unknown
): number | undefined {
  return readCapabilityItems(capability, value).length
}

export function readCapabilityItems(
  capability: CodexRuntimeCapability,
  value: unknown
): CodexRuntimeCapabilityItem[] {
  switch (capability) {
    case "apps":
      return readOfficialDataItems(value, readAppItem).concat(
        readTopLevelItems(value, ["apps", "items"], readAppItem)
      )
    case "collaborationModes":
      return readTopLevelItems(value, ["collaborationModes", "items", "data"])
    case "models":
      return readTopLevelItems(value, ["models", "items", "data"])
    case "mcpServers":
      return readOfficialDataItems(value, readMcpServerItem).concat(
        readTopLevelItems(value, ["servers", "items"], readMcpServerItem)
      )
    case "plugins":
      return readTopLevelItems(value, ["plugins", "items", "data"], readPluginItem)
    case "skills":
      return readSkillItems(value)
    case "config":
      return []
  }
}

function readSkillItems(value: unknown): CodexRuntimeCapabilityItem[] {
  return readTopLevelItems(value, ["skills"], readSkillItem).concat(
    readSkillsFromGroups(value)
  )
}

function readSkillsFromGroups(value: unknown): CodexRuntimeCapabilityItem[] {
  const result = readObject(value)
  const groups =
    (Array.isArray(result?.data) && result.data) ||
    (Array.isArray(result?.items) && result.items) ||
    (Array.isArray(result?.cwds) && result.cwds) ||
    (Array.isArray(value) && value) ||
    []

  return groups.flatMap((rawGroup) => {
    const group = readObject(rawGroup)
    if (!group) {
      return []
    }

    const source = readRuntimeItemSource(group)
    const skills = group.skills
    if (!Array.isArray(skills)) {
      return []
    }

    return readTopLevelItems(skills, [], readSkillItem).map((skill) => ({
      ...skill,
      source: skill.source ?? source,
    }))
  })
}

function readOfficialDataItems(
  value: unknown,
  reader: (
    item: Record<string, unknown>,
    source?: string
  ) => CodexRuntimeCapabilityItem | null
) {
  const result = readObject(value)
  if (!Array.isArray(result?.data)) {
    return []
  }

  return readTopLevelItems(result.data, [], reader)
}

export function readRuntimeItems(value: unknown): CodexRuntimeCapabilityItem[] {
  return readTopLevelItems(value, ["items", "data"])
}

function readTopLevelItems(
  value: unknown,
  keys: readonly string[],
  reader: (
    item: Record<string, unknown>,
    source?: string
  ) => CodexRuntimeCapabilityItem | null = readRuntimeItem
): CodexRuntimeCapabilityItem[] {
  if (typeof value === "string") {
    return [{ name: value }]
  }

  if (Array.isArray(value)) {
    return value
      .map((rawItem) => {
        if (typeof rawItem === "string") {
          return { name: rawItem }
        }
        const item = readObject(rawItem)
        return item ? reader(item, readRuntimeItemSource(item)) : null
      })
      .filter((item): item is CodexRuntimeCapabilityItem => item !== null)
  }

  const result = readObject(value)
  if (!result) {
    return []
  }

  for (const key of keys) {
    const child = result[key]
    if (Array.isArray(child)) {
      return readTopLevelItems(child, [], reader)
    }
  }

  const ownItem = reader(result, readRuntimeItemSource(result))
  return ownItem ? [ownItem] : []
}

function readRuntimeItem(
  item: Record<string, unknown>,
  source?: string
): CodexRuntimeCapabilityItem | null {
  const id =
    readScalarAsString(item, ["id"]) ??
    readScalarAsString(item, ["name"]) ??
    readScalarAsString(item, ["slug"])
  const name =
    readString(item, ["name"]) ??
    readString(item, ["title"]) ??
    readScalarAsString(item, ["id"]) ??
    readString(item, ["command"])
  if (!name) {
    return null
  }

  return {
    id,
    name,
    path: readScalarAsString(item, ["path"]),
    source,
    sourceType: readSourceType(item),
    status:
      readScalarAsString(item, ["status"]) ??
      readScalarAsString(item, ["state"]) ??
      readScalarAsString(item, ["enabled"]) ??
      readScalarAsString(item, ["ok"]),
  }
}

function readSkillItem(
  item: Record<string, unknown>,
  source?: string
): CodexRuntimeCapabilityItem | null {
  const runtimeItem = readRuntimeItem(item, source)
  if (!runtimeItem) {
    return null
  }

  return {
    ...runtimeItem,
    enabled: readBoolean(item, ["enabled"]),
    path:
      readScalarAsString(item, ["path"]) ??
      readScalarAsString(item, ["root"]) ??
      runtimeItem.path,
    scope: readScalarAsString(item, ["scope"]),
  }
}

function readMcpServerItem(
  item: Record<string, unknown>,
  source?: string
): CodexRuntimeCapabilityItem | null {
  const runtimeItem = readRuntimeItem(item, source)
  if (!runtimeItem) {
    return null
  }

  return {
    ...runtimeItem,
    authStatus:
      readScalarAsString(item, ["authStatus"]) ??
      readScalarAsString(item, ["auth_status"]),
    childrenCount: countChildItems(item, ["tools", "resources"]),
    enabled: readBoolean(item, ["enabled"]),
  }
}

function readPluginItem(
  item: Record<string, unknown>,
  source?: string
): CodexRuntimeCapabilityItem | null {
  const runtimeItem = readRuntimeItem(item, source)
  if (!runtimeItem) {
    return null
  }

  return {
    ...runtimeItem,
    childrenCount: countChildItems(item, ["apps", "mcpServers", "skills", "tools"]),
    installed: readBoolean(item, ["installed"]),
  }
}

function readAppItem(
  item: Record<string, unknown>,
  source?: string
): CodexRuntimeCapabilityItem | null {
  const runtimeItem = readRuntimeItem(item, source)
  if (!runtimeItem) {
    return null
  }

  return {
    ...runtimeItem,
    isAccessible: readBoolean(item, ["isAccessible"]),
    enabled: readBoolean(item, ["isEnabled"]) ?? readBoolean(item, ["enabled"]),
  }
}

function readRuntimeItemSource(
  item: Record<string, unknown>
): string | undefined {
  for (const key of runtimeSourceKeys) {
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

function countChildItems(item: Record<string, unknown>, keys: readonly string[]) {
  return keys.reduce((count, key) => {
    const child = item[key]
    return count + (Array.isArray(child) ? child.length : 0)
  }, 0)
}

function readSourceType(item: Record<string, unknown>) {
  const source = readObject(item.source)
  return source ? readScalarAsString(source, ["type"]) : undefined
}

export function readEffectiveConfig(
  value: unknown
): CodexRuntimeStatus["config"] {
  const config = readObject(value)?.config ?? value
  const approvalPolicy =
    readString(config, ["approval_policy"]) ??
    readString(config, ["approvalPolicy"])
  const sandboxMode =
    readString(config, ["sandbox_mode"]) ?? readString(config, ["sandboxMode"])

  return {
    approvalPolicy,
    approvalPolicyDiagnostic:
      approvalPolicy === undefined
        ? "not exposed by config/read"
        : undefined,
    model: readString(config, ["model"]),
    modelProvider:
      readString(config, ["model_provider"]) ??
      readString(config, ["modelProvider"]),
    sandboxMode,
    sandboxModeDiagnostic:
      sandboxMode === undefined ? "not exposed by config/read" : undefined,
  }
}
