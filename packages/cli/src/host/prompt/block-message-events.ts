import type {
  BlockMessageItem,
  BlockMessageThread,
} from "../host-contracts"
import {
  createHostTranslator,
  type HostTranslator,
} from "../i18n/host-i18n"

export type BlockMessageTarget = {
  blockId: string
  filePath: string
  title: string
}

export type BlockMessageStoreSnapshot = {
  threads: Record<string, BlockMessageThread>
}

const timers = new Map<string, ReturnType<typeof setTimeout>[]>()
const defaultBlockMessageTranslator = createHostTranslator("en")
let nextThreadId = 1
let currentSnapshot: BlockMessageStoreSnapshot = {
  threads: {},
}
const listeners = new Set<() => void>()

export function blockMessageKey({
  blockId,
  filePath,
}: {
  blockId: string
  filePath: string
}) {
  return `${filePath}::${blockId}`
}

export function getBlockMessageStoreSnapshot() {
  return currentSnapshot
}

export function subscribeBlockMessageStore(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function publish(threads: Record<string, BlockMessageThread>) {
  currentSnapshot = { threads }
  for (const listener of listeners) {
    listener()
  }
}

function upsertThread(
  key: string,
  updater: (thread: BlockMessageThread | undefined) => BlockMessageThread
) {
  publish({
    ...currentSnapshot.threads,
    [key]: updater(currentSnapshot.threads[key]),
  })
}

function clearTimers(key: string) {
  for (const timer of timers.get(key) ?? []) {
    clearTimeout(timer)
  }
  timers.delete(key)
}

function createItem(
  id: string,
  kind: BlockMessageItem["kind"],
  title: string,
  summary: string,
  status: BlockMessageItem["status"] = "done"
): BlockMessageItem {
  return {
    id,
    kind,
    status,
    summary,
    title,
  }
}

export function startBlockMessageThread({
  request,
  target,
  t = defaultBlockMessageTranslator,
}: {
  request: string
  target: BlockMessageTarget
  t?: HostTranslator
}) {
  const key = blockMessageKey({
    blockId: target.blockId,
    filePath: target.filePath,
  })
  clearTimers(key)

  const threadId = `block_message_${nextThreadId}`
  nextThreadId += 1
  const requestSummary =
    request.length > 80 ? `${request.slice(0, 77)}...` : request

  upsertThread(key, () => ({
    blockId: target.blockId,
    filePath: target.filePath,
    id: threadId,
    isOpen: false,
    items: [
      createItem("request", "request", t("block.request"), requestSummary),
      createItem(
        "status-start",
        "status",
        t("block.sent"),
        t("block.waitingForAgent"),
        "loading"
      ),
    ],
    phase: "running",
    readAt: null,
    title: target.title,
  }))
}

export function finishBlockMessageThread({
  target,
  t = defaultBlockMessageTranslator,
  threadId,
  turnId,
}: {
  target: BlockMessageTarget
  t?: HostTranslator
  threadId: string
  turnId?: string | null
}) {
  const key = blockMessageKey({
    blockId: target.blockId,
    filePath: target.filePath,
  })
  clearTimers(key)
  upsertThread(key, (thread) => ({
    blockId: target.blockId,
    filePath: target.filePath,
    id: thread?.id ?? `block_message_${nextThreadId++}`,
    isOpen: thread?.isOpen ?? false,
    items: [
      ...(thread?.items.filter((item) => item.id !== "status-start") ?? []),
      createItem(
        "status-done",
        "status",
        t("block.done"),
        t("block.agentAccepted")
      ),
    ],
    phase: "done",
    readAt: null,
    threadId,
    title: target.title,
    turnId: turnId ?? null,
  }))
}

export function failBlockMessageThread({
  error,
  target,
  t = defaultBlockMessageTranslator,
}: {
  error: string
  target: BlockMessageTarget
  t?: HostTranslator
}) {
  const key = blockMessageKey({
    blockId: target.blockId,
    filePath: target.filePath,
  })
  clearTimers(key)
  upsertThread(key, (thread) => ({
    blockId: target.blockId,
    filePath: target.filePath,
    id: thread?.id ?? `block_message_${nextThreadId++}`,
    isOpen: thread?.isOpen ?? false,
    items: [
      ...(thread?.items.filter((item) => item.id !== "status-start") ?? []),
      createItem("status-failed", "status", t("block.failed"), error, "failed"),
    ],
    phase: "failed",
    readAt: null,
    title: target.title,
  }))
}

export function setBlockMessageThreadOpen({
  blockId,
  filePath,
  isOpen,
}: {
  blockId: string
  filePath: string
  isOpen: boolean
}) {
  const key = blockMessageKey({ blockId, filePath })
  const thread = currentSnapshot.threads[key]
  if (!thread) {
    return
  }

  upsertThread(key, () => ({
    ...thread,
    isOpen,
    readAt:
      isOpen && thread.phase !== "running"
        ? Date.now()
        : thread.readAt ?? null,
  }))
}

export function clearBlockMessageThreads() {
  for (const key of timers.keys()) {
    clearTimers(key)
  }
  currentSnapshot = { threads: {} }
  for (const listener of listeners) {
    listener()
  }
}
