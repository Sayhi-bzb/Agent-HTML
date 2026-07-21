import { publishCanvasInspection } from "../api/api"
import type { CanvasStore } from "./canvas-store"

export function createCanvasInspectionPublisher({
  delay = 80,
  onError = (error: unknown) =>
    console.error("[agent-html] Canvas inspection sync failed", error),
  publish = publishCanvasInspection,
  store,
}: {
  delay?: number
  onError?: (error: unknown) => void
  publish?: typeof publishCanvasInspection
  store: CanvasStore
}) {
  let timer: ReturnType<typeof setTimeout> | null = null

  return {
    dispose() {
      if (timer) clearTimeout(timer)
      timer = null
    },
    request() {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        void publish(store.getInspectionDocument()).catch(onError)
      }, delay)
    },
  }
}
