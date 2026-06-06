import * as React from "react"

export type SecondaryWindowBridgeOptions<TSnapshot, TAction> = {
  canUseNativeWindow: () => boolean
  closeNativeWindow: () => Promise<void>
  onAction: (action: TAction) => void
  openNativeWindow: () => Promise<boolean>
  preloadWindowApp: () => void
  publishSnapshot: (snapshot: TSnapshot) => Promise<void>
  snapshot: TSnapshot | null
  subscribeActions: (handler: (action: TAction) => void) => Promise<() => void>
}

export type SecondaryWindowBridgeState = {
  close: () => void
  isOpen: boolean
  open: () => void
  setOpen: (open: boolean) => void
  useNativeFallback: boolean
  useNativeWindow: boolean
}

export function useSecondaryWindowBridge<TSnapshot, TAction>({
  canUseNativeWindow,
  closeNativeWindow,
  onAction,
  openNativeWindow,
  preloadWindowApp,
  publishSnapshot,
  snapshot,
  subscribeActions,
}: SecondaryWindowBridgeOptions<TSnapshot, TAction>): SecondaryWindowBridgeState {
  const [isOpen, setIsOpen] = React.useState(false)
  const [useNativeFallback, setUseNativeFallback] = React.useState(false)
  const useNativeWindow = canUseNativeWindow() && !useNativeFallback

  React.useEffect(() => {
    if (!useNativeWindow) {
      return undefined
    }

    preloadWindowApp()

    let cleanup: (() => void) | undefined
    void subscribeActions(onAction).then((unlisten) => {
      cleanup = unlisten
    })

    return () => cleanup?.()
  }, [onAction, preloadWindowApp, subscribeActions, useNativeWindow])

  React.useEffect(() => {
    if (!isOpen || !useNativeWindow || !snapshot) {
      if (useNativeWindow && !isOpen) {
        void closeNativeWindow()
      }
      return
    }

    void publishSnapshot(snapshot)
  }, [
    closeNativeWindow,
    isOpen,
    publishSnapshot,
    snapshot,
    useNativeWindow,
  ])

  const open = React.useCallback(() => {
    if (!useNativeWindow) {
      setIsOpen(true)
      return
    }

    setIsOpen(true)
    if (snapshot) {
      void publishSnapshot(snapshot)
    }
    void openNativeWindow().then((opened) => {
      if (opened) {
        if (snapshot) {
          void publishSnapshot(snapshot)
        }
        return
      }
      setUseNativeFallback(true)
    })
  }, [openNativeWindow, publishSnapshot, snapshot, useNativeWindow])

  const close = React.useCallback(() => {
    setIsOpen(false)
  }, [])

  const setOpen = React.useCallback(
    (openValue: boolean) => {
      if (openValue) {
        open()
        return
      }
      close()
    },
    [close, open]
  )

  return {
    close,
    isOpen,
    open,
    setOpen,
    useNativeFallback,
    useNativeWindow,
  }
}
