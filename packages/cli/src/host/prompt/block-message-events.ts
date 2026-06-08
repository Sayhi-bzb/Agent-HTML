import type {
  BlockMessageItem,
  BlockMessageThread,
} from "../host-contracts"

export type BlockMessageTarget = {
  blockId: string
  filePath: string
  title: string
}

export type BlockMessageStoreSnapshot = {
  threads: Record<string, BlockMessageThread>
}

const mockTimelineDelays = [400, 900, 1300, 1700, 2200]
const timers = new Map<string, ReturnType<typeof setTimeout>[]>()
export const enableMockBlockMessageTimeline = false
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

function createMockItems(request: string): BlockMessageItem[] {
  return [
    createItem(
      "reasoning",
      "reasoning",
      "Reasoning",
      "Mapped the request to this block's implementation context."
    ),
    createItem(
      "tool-use",
      "tool_use",
      "Tool use",
      "Prepared block-scoped edit context and workspace checks."
    ),
    createItem(
      "observe",
      "observe",
      "Observe",
      "Observed current block state and available host metadata."
    ),
    createItem(
      "action",
      "action",
      "Action",
      "Applied the requested block-focused change path."
    ),
    createItem(
      "response",
      "response",
      "Finish",
      request.length > 64
        ? `${request.slice(0, 61)}...`
        : "Agent finished this block request."
    ),
  ]
}

export function startBlockMessageThread({
  request,
  target,
}: {
  request: string
  target: BlockMessageTarget
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
      createItem("request", "request", "Request", requestSummary),
      createItem(
        "status-start",
        "status",
        "Sent",
        "Waiting for agent...",
        "loading"
      ),
    ],
    phase: "running",
    title: target.title,
  }))

  if (!enableMockBlockMessageTimeline) {
    return
  }

  const mockItems = createMockItems(request)
  timers.set(
    key,
    mockItems.map((item, index) =>
      setTimeout(() => {
        upsertThread(key, (thread) => {
          if (!thread || thread.id !== threadId || thread.phase !== "running") {
            return thread as BlockMessageThread
          }

          const isLast = index === mockItems.length - 1
          const items = thread.items.filter(
            (existing) => existing.id !== "status-start"
          )

          return {
            ...thread,
            items: [
              ...items,
              item,
              ...(isLast
                ? [
                    createItem(
                      "status-done",
                      "status",
                      "Done",
                      "Agent finished this block request."
                    ),
                  ]
                : [
                    createItem(
                      "status-start",
                      "status",
                      "Working",
                      "Agent is working...",
                      "loading"
                    ),
                  ]),
            ],
            phase: isLast ? "done" : "running",
          }
        })
      }, mockTimelineDelays[index])
    )
  )
}

export function finishBlockMessageThread({
  target,
  threadId,
  turnId,
}: {
  target: BlockMessageTarget
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
        "Done",
        "Agent accepted this block request."
      ),
    ],
    phase: "done",
    threadId,
    title: target.title,
    turnId: turnId ?? null,
  }))
}

export function failBlockMessageThread({
  error,
  target,
}: {
  error: string
  target: BlockMessageTarget
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
      createItem("status-failed", "status", "Failed", error, "failed"),
    ],
    phase: "failed",
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
