import { isTauri } from "@tauri-apps/api/core"
import { emitTo, listen } from "@tauri-apps/api/event"

export type SecondaryWindowSurfaceConfig = {
  actionEvent: string
  defaultSize: {
    height: number
    width: number
  }
  label: string
  preload?: () => Promise<unknown> | unknown
  snapshotEvent: string
  snapshotStorageKey: string
  title: string
  url: string
}

export type SecondaryWindowSurface<TSnapshot, TAction> = {
  canUseNativeWindow: () => boolean
  dispatchAction: (action: TAction) => Promise<void>
  hideWindow: () => Promise<void>
  openWindow: () => Promise<boolean>
  preloadWindowApp: () => void
  publishSnapshot: (snapshot: TSnapshot) => Promise<void>
  readSnapshotCache: () => TSnapshot | null
  setLatestSnapshot: (snapshot: TSnapshot | null) => void
  subscribeActions: (handler: (action: TAction) => void) => Promise<() => void>
  subscribeSnapshots: (
    handler: (snapshot: TSnapshot) => void
  ) => Promise<() => void>
}

export function createSecondaryWindowSurface<TSnapshot, TAction>(
  config: SecondaryWindowSurfaceConfig
): SecondaryWindowSurface<TSnapshot, TAction> {
  const canUseNativeWindow = () => isTauri()

  const readSnapshotCache = () => {
    if (typeof window === "undefined") {
      return null
    }

    const rawSnapshot = window.localStorage.getItem(config.snapshotStorageKey)
    if (!rawSnapshot) {
      return null
    }

    try {
      return JSON.parse(rawSnapshot) as TSnapshot
    } catch {
      window.localStorage.removeItem(config.snapshotStorageKey)
      return null
    }
  }

  const writeSnapshotCache = (snapshot: TSnapshot | null) => {
    if (typeof window === "undefined") {
      return
    }

    if (!snapshot) {
      window.localStorage.removeItem(config.snapshotStorageKey)
      return
    }

    window.localStorage.setItem(
      config.snapshotStorageKey,
      JSON.stringify(snapshot)
    )
  }

  const setLatestSnapshot = (snapshot: TSnapshot | null) => {
    writeSnapshotCache(snapshot)
  }

  return {
    canUseNativeWindow,
    dispatchAction: async (action) => {
      if (!canUseNativeWindow()) {
        return
      }

      await emitTo("main", config.actionEvent, action)
    },
    hideWindow: async () => {
      if (!canUseNativeWindow()) {
        return
      }

      const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
      const existingWindow = await WebviewWindow.getByLabel(config.label)
      await existingWindow?.hide()
    },
    openWindow: async () => {
      if (!canUseNativeWindow()) {
        return false
      }

      try {
        const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow")
        const existingWindow = await WebviewWindow.getByLabel(config.label)
        if (existingWindow) {
          await existingWindow.show()
          await existingWindow.setFocus()
          return true
        }

        const secondaryWindow = new WebviewWindow(config.label, {
          decorations: false,
          height: config.defaultSize.height,
          title: config.title,
          url: config.url,
          width: config.defaultSize.width,
        })

        await new Promise<void>((resolve, reject) => {
          void secondaryWindow.once("tauri://created", () => resolve())
          void secondaryWindow.once("tauri://error", (event) => {
            reject(event.payload)
          })
        })
        await secondaryWindow.show()
        await secondaryWindow.setFocus()
        return true
      } catch {
        return false
      }
    },
    preloadWindowApp: () => {
      if (!canUseNativeWindow()) {
        return
      }

      void config.preload?.()
    },
    publishSnapshot: async (snapshot) => {
      setLatestSnapshot(snapshot)

      if (!canUseNativeWindow()) {
        return
      }

      await emitTo(config.label, config.snapshotEvent, snapshot)
    },
    readSnapshotCache,
    setLatestSnapshot,
    subscribeActions: async (handler) => {
      if (!canUseNativeWindow()) {
        return () => {}
      }

      return listen<TAction>(config.actionEvent, (event) => {
        handler(event.payload)
      })
    },
    subscribeSnapshots: async (handler) => {
      if (!canUseNativeWindow()) {
        return () => {}
      }

      return listen<TSnapshot>(config.snapshotEvent, (event) => {
        handler(event.payload)
      })
    },
  }
}
