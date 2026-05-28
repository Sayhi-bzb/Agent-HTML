import type { CodexRuntimeStatus, CodexThreadSummary } from "./types"
import { readObject, readScalarAsString, readString } from "./object-readers"

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
  if (Array.isArray(value)) {
    return value.length
  }

  const object = readObject(value)
  if (!object) {
    return undefined
  }

  for (const key of [
    "apps",
    "collaborationModes",
    "items",
    "models",
    "plugins",
    "servers",
    "skills",
  ]) {
    const child = object[key]
    if (Array.isArray(child)) {
      return child.length
    }
  }

  return undefined
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
