export type CanvasShortcutAction =
  | { type: "clear-selection" }
  | { type: "fit-all" }
  | { type: "fit-selection" }
  | { type: "move"; dx: number; dy: number }
  | { type: "open-shortcuts" }
  | { type: "select-all" }
  | { type: "tool-navigate" }
  | { type: "tool-select" }
  | { type: "zoom-in" }
  | { type: "zoom-out" }
  | { type: "zoom-reset" }

export type CanvasShortcutInput = {
  altKey: boolean
  ctrlKey: boolean
  isComposing: boolean
  key: string
  metaKey: boolean
  shiftKey: boolean
}

const arrowDirections = {
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
} as const

export function isCanvasShortcutBlocked(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(
      target.closest(
        "[data-canvas-region='node-content'], [data-canvas-region='dock'], [data-canvas-region='overlay'], input, textarea, select, [contenteditable]:not([contenteditable='false'])"
      )
    )
  )
}

export function resolveCanvasShortcut({
  altKey,
  ctrlKey,
  isComposing,
  key,
  metaKey,
  shiftKey,
}: CanvasShortcutInput): CanvasShortcutAction | null {
  if (altKey || isComposing) return null

  const command = ctrlKey || metaKey
  if (command) {
    return !shiftKey && key.toLowerCase() === "a"
      ? { type: "select-all" }
      : null
  }

  const direction = arrowDirections[key as keyof typeof arrowDirections]
  if (direction) {
    const step = shiftKey ? 10 : 1
    return {
      dx: direction[0] * step,
      dy: direction[1] * step,
      type: "move",
    }
  }

  if (key === "+" || key === "=") return { type: "zoom-in" }
  if (key === "-") return { type: "zoom-out" }
  if (key === "0") return { type: "zoom-reset" }
  if (key === "1") return { type: "fit-all" }
  if (key === "2") return { type: "fit-selection" }
  if (key === "?") return { type: "open-shortcuts" }
  if (key === "Escape") return { type: "clear-selection" }
  if (key.toLowerCase() === "h") return { type: "tool-navigate" }
  if (key.toLowerCase() === "v") return { type: "tool-select" }
  return null
}
