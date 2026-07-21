import { afterEach, describe, expect, it, vi } from "vitest"

import {
  resolveCanvasThemeBootstrap,
  startCanvasThemeBootstrap,
} from "./theme-bootstrap"
import {
  canvasThemeSnapshotVersion,
  createCanvasThemeBootstrapMessage,
  createCanvasThemeRequestMessage,
  type CanvasThemeSnapshot,
} from "./theme-sync-contract"

const snapshot: CanvasThemeSnapshot = {
  darkCssVariables: { "--background": "#111111" },
  draftCssVariables: { "--radius": "0.75rem" },
  fontStylesheetPaths: [],
  lightCssVariables: { "--background": "#ffffff" },
  mode: "dark",
  presetId: "claude-plus",
  version: canvasThemeSnapshotVersion,
}
const requestId = "desktop-theme-request-1"

function createHostWindow() {
  let messageListener: ((event: MessageEvent<unknown>) => void) | null = null
  const parent = { postMessage: vi.fn() }
  const hostWindow = {
    addEventListener(type: string, listener: (event: MessageEvent<unknown>) => void) {
      if (type === "message") messageListener = listener
    },
    clearInterval: globalThis.clearInterval.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
    crypto: { randomUUID: () => requestId },
    parent,
    removeEventListener(type: string, listener: (event: MessageEvent<unknown>) => void) {
      if (type === "message" && messageListener === listener) messageListener = null
    },
    setInterval: globalThis.setInterval.bind(globalThis),
    setTimeout: globalThis.setTimeout.bind(globalThis),
  }

  return {
    dispatch(data: unknown, source: unknown = parent) {
      messageListener?.({ data, source } as MessageEvent<unknown>)
    },
    hostWindow: hostWindow as unknown as Window,
    parent,
  }
}

describe("Canvas theme bootstrap", () => {
  afterEach(() => vi.useRealTimers())

  it("restores the global Desktop selection and draft", () => {
    expect(resolveCanvasThemeBootstrap(snapshot)).toEqual({
      draft: { cssVariables: { "--radius": "0.75rem" } },
      mode: "dark",
      presetId: "claude-plus",
    })
  })

  it("falls back when Desktop has no snapshot or the preset was removed", () => {
    expect(resolveCanvasThemeBootstrap(null)).toBeNull()
    expect(
      resolveCanvasThemeBootstrap({ ...snapshot, presetId: "removed-preset" })
    ).toBeNull()
  })

  it("accepts only the matching parent response and stops retrying", () => {
    vi.useFakeTimers()
    const { dispatch, hostWindow, parent } = createHostWindow()
    const onBootstrap = vi.fn()
    const onComplete = vi.fn()
    const dispose = startCanvasThemeBootstrap({
      hostWindow,
      onBootstrap,
      onComplete,
      requestId,
    })

    expect(parent.postMessage).toHaveBeenCalledWith(
      createCanvasThemeRequestMessage(requestId),
      "*"
    )

    dispatch(
      createCanvasThemeBootstrapMessage({ requestId, snapshot }),
      {} as Window
    )
    dispatch(
      createCanvasThemeBootstrapMessage({
        requestId: "different-theme-request",
        snapshot,
      })
    )
    expect(onComplete).not.toHaveBeenCalled()

    dispatch(createCanvasThemeBootstrapMessage({ requestId, snapshot }))
    expect(onBootstrap).toHaveBeenCalledWith(
      resolveCanvasThemeBootstrap(snapshot)
    )
    expect(onComplete).toHaveBeenCalledOnce()

    vi.advanceTimersByTime(2_000)
    expect(parent.postMessage).toHaveBeenCalledOnce()
    dispose()
  })

  it("completes without a snapshot after the Desktop timeout", () => {
    vi.useFakeTimers()
    const { hostWindow } = createHostWindow()
    const onBootstrap = vi.fn()
    const onComplete = vi.fn()

    startCanvasThemeBootstrap({ hostWindow, onBootstrap, onComplete, requestId })
    vi.advanceTimersByTime(1_500)

    expect(onBootstrap).not.toHaveBeenCalled()
    expect(onComplete).toHaveBeenCalledOnce()
  })
})
