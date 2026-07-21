import type { CanvasThemePresetId } from "#agent-html-playground/theme/presets"
import { canvasThemePresets } from "#agent-html-playground/theme/presets"

import type { CanvasThemeDraft } from "./theme-draft"
import {
  createCanvasThemeRequestMessage,
  readCanvasThemeBootstrapMessage,
  type CanvasThemeMode,
  type CanvasThemeSnapshot,
} from "./theme-sync-contract"

export type CanvasThemeBootstrapState = {
  draft: CanvasThemeDraft
  mode: CanvasThemeMode
  presetId: CanvasThemePresetId
}

type StartCanvasThemeBootstrapOptions = {
  hostWindow?: Window
  onBootstrap: (state: CanvasThemeBootstrapState | null) => void
  onComplete: () => void
  requestId?: string
  retryMilliseconds?: number
  timeoutMilliseconds?: number
}

export function resolveCanvasThemeBootstrap(
  snapshot: CanvasThemeSnapshot | null
): CanvasThemeBootstrapState | null {
  if (!snapshot) {
    return null
  }

  const preset = canvasThemePresets.find(
    (candidate) => candidate.id === snapshot.presetId
  )
  if (!preset) {
    return null
  }

  return {
    draft: { cssVariables: { ...snapshot.draftCssVariables } },
    mode: snapshot.mode,
    presetId: preset.id,
  }
}

export function startCanvasThemeBootstrap({
  hostWindow = window,
  onBootstrap,
  onComplete,
  requestId = hostWindow.crypto.randomUUID(),
  retryMilliseconds = 250,
  timeoutMilliseconds = 1_500,
}: StartCanvasThemeBootstrapOptions) {
  if (hostWindow.parent === hostWindow) {
    onComplete()
    return () => {}
  }

  const parentWindow = hostWindow.parent
  const request = createCanvasThemeRequestMessage(requestId)
  let complete = false
  let retryTimer: number | null = null
  let fallbackTimer: number | null = null
  const finish = () => {
    if (complete) {
      return
    }
    complete = true
    if (retryTimer !== null) {
      hostWindow.clearInterval(retryTimer)
    }
    if (fallbackTimer !== null) {
      hostWindow.clearTimeout(fallbackTimer)
    }
    onComplete()
  }
  const requestBootstrap = () => parentWindow.postMessage(request, "*")
  const handleMessage = (event: MessageEvent<unknown>) => {
    if (event.source !== parentWindow) {
      return
    }

    const message = readCanvasThemeBootstrapMessage(event.data)
    if (!message || message.requestId !== requestId) {
      return
    }

    onBootstrap(resolveCanvasThemeBootstrap(message.snapshot))
    finish()
  }

  hostWindow.addEventListener("message", handleMessage)
  retryTimer = hostWindow.setInterval(requestBootstrap, retryMilliseconds)
  fallbackTimer = hostWindow.setTimeout(finish, timeoutMilliseconds)
  requestBootstrap()

  return () => {
    complete = true
    hostWindow.removeEventListener("message", handleMessage)
    if (retryTimer !== null) {
      hostWindow.clearInterval(retryTimer)
    }
    if (fallbackTimer !== null) {
      hostWindow.clearTimeout(fallbackTimer)
    }
  }
}
