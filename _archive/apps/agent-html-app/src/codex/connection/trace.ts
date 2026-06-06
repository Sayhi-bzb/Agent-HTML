import { invoke, isTauri } from "@tauri-apps/api/core"

import { TRACE_STORAGE_KEY, TRACE_TEXT_LIMIT } from "./constants"
import { readObject } from "./object-readers"
import { readThreadId, readThreads, readTurnId } from "./parsers"
import type { ConnectionTracePayload } from "./types"

export function markCodexStartupEvent(
  event: string,
  payload: ConnectionTracePayload = {}
): void {
  writeConnectionTrace(`startup:${event}`, payload)
}

export function summarizeTraceValue(value: unknown): unknown {
  if (typeof value === "string") {
    return truncateTraceText(value)
  }

  if (Array.isArray(value)) {
    return value.slice(0, 5).map(summarizeTraceValue)
  }

  const object = readObject(value)
  if (!object) {
    return value
  }

  const summary: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(object)) {
    if (key === "text" || key === "promptText") {
      summary[key] = typeof child === "string" ? `<text:${child.length}>` : child
      continue
    }
    summary[key] = summarizeTraceValue(child)
  }
  return summary
}

export function summarizeRpcResult(value: unknown): unknown {
  const object = readObject(value)
  if (!object) {
    return summarizeTraceValue(value)
  }

  const threadId = readThreadId(value)
  const turnId = readTurnId(value)
  const threads = readThreads(value)
  return {
    keys: Object.keys(object),
    threadCount: threads.length || undefined,
    threadId: threadId ?? undefined,
    turnId: turnId ?? undefined,
  }
}

export function writeConnectionTrace(
  event: string,
  payload: ConnectionTracePayload
): void {
  if (!isConnectionTraceEnabled()) {
    return
  }

  const line = {
    event,
    payload,
    side: "frontend",
    ts: new Date().toISOString(),
  }
  console.info("[codex-connection-trace]", line)

  if (!isTauri()) {
    return
  }

  void invoke("codex_connection_trace", {
    input: {
      event,
      payload,
    },
  }).catch((error) => {
    console.warn("[codex-connection-trace] write failed", error)
  })
}

function isConnectionTraceEnabled(): boolean {
  return (
    typeof localStorage !== "undefined" &&
    localStorage.getItem(TRACE_STORAGE_KEY) === "1"
  )
}

function truncateTraceText(value: string): string {
  return value.length > TRACE_TEXT_LIMIT
    ? `${value.slice(0, TRACE_TEXT_LIMIT)}...`
    : value
}
