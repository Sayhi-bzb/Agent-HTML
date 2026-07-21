import type { CodexThread } from "../api/api"

const maximumThreadLabelLength = 512

export function shortCodexThreadId(threadId: string) {
  return threadId.length > 18
    ? `${threadId.slice(0, 10)}...${threadId.slice(-6)}`
    : threadId
}

export function codexThreadLabel(thread: CodexThread) {
  const label = thread.name?.trim() || thread.preview?.trim()
  return (label || shortCodexThreadId(thread.id)).slice(
    0,
    maximumThreadLabelLength
  )
}

export function resolveActiveCodexThreadLabel({
  activeThreadId,
  threads,
}: {
  activeThreadId: string | null
  threads: readonly CodexThread[]
}) {
  if (!activeThreadId) return null
  const activeThread = threads.find((thread) => thread.id === activeThreadId)
  return activeThread
    ? codexThreadLabel(activeThread)
    : shortCodexThreadId(activeThreadId)
}
