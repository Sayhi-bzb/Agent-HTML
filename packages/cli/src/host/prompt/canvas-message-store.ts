import type { FloatingPromptTarget } from "../host-contracts"

export type CanvasMessageSubmitInput = {
  request: string
  target: FloatingPromptTarget
}

export type CanvasMessageHostSnapshot = {
  activeTarget: FloatingPromptTarget | null
  draft: string
  enabled: boolean
  onClose: () => void
  onDraftChange: (draft: string) => void
  onOpenTarget: (target: FloatingPromptTarget) => void
  onPromptSubmit: (input: CanvasMessageSubmitInput) => Promise<void>
  status: string
}

const noop = () => {}
const noopSubmit = async () => {}

const disabledSnapshot: CanvasMessageHostSnapshot = {
  activeTarget: null,
  draft: "",
  enabled: false,
  onClose: noop,
  onDraftChange: noop,
  onOpenTarget: noop,
  onPromptSubmit: noopSubmit,
  status: "",
}

let currentSnapshot = disabledSnapshot
const listeners = new Set<() => void>()

export function clearCanvasMessageHost() {
  publishCanvasMessageHost(disabledSnapshot)
}

export function getCanvasMessageHostSnapshot() {
  return currentSnapshot
}

export function publishCanvasMessageHost(snapshot: CanvasMessageHostSnapshot) {
  currentSnapshot = snapshot.enabled ? snapshot : disabledSnapshot
  for (const listener of listeners) {
    listener()
  }
}

export function subscribeCanvasMessageHost(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
