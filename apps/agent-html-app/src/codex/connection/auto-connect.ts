import { AUTO_CONNECT_DELAY_MS } from "./constants"
import type {
  CodexConnectionSettings,
  ScheduledCodexAutoConnect,
} from "./types"

export function scheduleCodexAutoConnect({
  connect,
  delayMs = AUTO_CONNECT_DELAY_MS,
  getAttemptId,
  onError,
  onSkip,
  settings,
}: {
  connect: (settings: CodexConnectionSettings) => Promise<void>
  delayMs?: number
  getAttemptId: () => number
  onError?: (error: unknown) => void
  onSkip?: () => void
  settings: CodexConnectionSettings
}): ScheduledCodexAutoConnect {
  const scheduledAttemptId = getAttemptId()
  let isCancelled = false
  const timeout = globalThis.setTimeout(() => {
    if (isCancelled || getAttemptId() !== scheduledAttemptId) {
      onSkip?.()
      return
    }

    void connect(settings).catch((error) => {
      if (!isCancelled) {
        onError?.(error)
      }
    })
  }, delayMs)

  return {
    cancel() {
      isCancelled = true
      globalThis.clearTimeout(timeout)
    },
  }
}
