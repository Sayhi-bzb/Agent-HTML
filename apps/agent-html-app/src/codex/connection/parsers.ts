import type {
  CodexRuntimeCapabilityItem,
  CodexRuntimeStatus,
  CodexThreadSummary,
} from "./types"
import { readObject, readScalarAsString, readString } from "./object-readers"

const runtimeListKeys = [
  "apps",
  "collaborationModes",
  "items",
  "models",
  "plugins",
  "servers",
  "skills",
] as const

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

export function readRuntimeItems(value: unknown): CodexRuntimeCapabilityItem[] {
  return readRuntimeItemsFromValue(value)
}

function readRuntimeItemsFromValue(
  value: unknown,
  inheritedSource?: string
): CodexRuntimeCapabilityItem[] {
  if (typeof value === "string") {
    return [{ name: value, source: inheritedSource }]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      readRuntimeItemsFromValue(item, inheritedSource)
    )
  }

  const item = readObject(value)
  if (!item) {
    return []
  }

  const source = readRuntimeItemSource(item) ?? inheritedSource
  const nestedItems = runtimeListKeys.flatMap((key) => {
    const child = item[key]
    return Array.isArray(child) ? readRuntimeItemsFromValue(child, source) : []
  })
  const ownItem = readRuntimeItem(item, source)

  return ownItem ? [ownItem, ...nestedItems] : nestedItems
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
    source,
    status:
      readScalarAsString(item, ["status"]) ??
      readScalarAsString(item, ["state"]) ??
      readScalarAsString(item, ["enabled"]) ??
      readScalarAsString(item, ["ok"]),
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

export function readEffectiveConfig(
  value: unknown
): CodexRuntimeStatus["config"] {
  const config = readObject(value)?.config ?? value

  return {
    approvalPolicy:
      readString(config, ["approval_policy"]) ??
      readString(config, ["approvalPolicy"]),
    model: readString(config, ["model"]),
    modelProvider:
      readString(config, ["model_provider"]) ??
      readString(config, ["modelProvider"]),
    sandboxMode:
      readString(config, ["sandbox_mode"]) ??
      readString(config, ["sandboxMode"]),
  }
}
