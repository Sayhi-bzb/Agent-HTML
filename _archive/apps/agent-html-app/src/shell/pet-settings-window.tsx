import * as React from "react"
import { Trans } from "@lingui/react/macro"

import {
  PetSettingsContent,
  PetSettingsSurface,
  type PetSettingsAction,
  type PetSettingsBridge,
  type PetSettingsDispatch,
  type PetSettingsSurfaceSnapshot,
  type PetSettingsView,
} from "@/app/pet/host/pet-settings-content"
import {
  canUsePetSettingsNativeWindow,
  closePetSettingsNativeWindow,
  openPetSettingsNativeWindow,
  preloadPetSettingsNativeWindowApp,
  publishPetSettingsNativeSnapshot,
  subscribePetSettingsNativeActions,
} from "@/app/pet/host/pet-settings-native-bridge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/shared/ui/dialog"
import { useSecondaryWindowBridge } from "@/app/shared/window/use-secondary-window-bridge"

type PetSettingsWindowContextValue = {
  isOpen: boolean
  open: (view?: PetSettingsView) => void
  setOpen: (open: boolean, view?: PetSettingsView) => void
}

const defaultSettingsView: PetSettingsView = "AGENTS.md"

const PetSettingsWindowContext =
  React.createContext<PetSettingsWindowContextValue | null>(null)

export function usePetSettingsWindow() {
  const context = React.useContext(PetSettingsWindowContext)

  if (!context) {
    throw new Error(
      "usePetSettingsWindow must be used within PetSettingsWindowProvider."
    )
  }

  return context
}

export function PetSettingsWindowProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [targetView, setTargetView] =
    React.useState<PetSettingsView>(defaultSettingsView)
  const [pendingOpenView, setPendingOpenView] =
    React.useState<PetSettingsView | null>(null)
  const [settingsSnapshot, setSettingsSnapshot] =
    React.useState<PetSettingsSurfaceSnapshot | null>(null)
  const [settingsDispatch, setSettingsDispatch] =
    React.useState<PetSettingsDispatch>(() => noopSettingsDispatch)
  const settingsCloseRef = React.useRef<() => void>(() => {})

  const handleNativeSettingsAction = React.useCallback(
    (action: PetSettingsAction) => {
      if (action.type === "close") {
        settingsCloseRef.current()
      }
      settingsDispatch(action)
    },
    [settingsDispatch]
  )

  const settingsWindowBridge = useSecondaryWindowBridge({
    canUseNativeWindow: canUsePetSettingsNativeWindow,
    closeNativeWindow: closePetSettingsNativeWindow,
    onAction: handleNativeSettingsAction,
    openNativeWindow: openPetSettingsNativeWindow,
    preloadWindowApp: preloadPetSettingsNativeWindowApp,
    publishSnapshot: publishPetSettingsNativeSnapshot,
    snapshot: settingsSnapshot,
    subscribeActions: subscribePetSettingsNativeActions,
  })

  React.useEffect(() => {
    settingsCloseRef.current = settingsWindowBridge.close
  }, [settingsWindowBridge.close])

  const handleSettingsBridgeChange = React.useCallback(
    (bridge: PetSettingsBridge) => {
      setSettingsDispatch(() => bridge.dispatch)
      setSettingsSnapshot((current) =>
        current === bridge.snapshot ? current : bridge.snapshot
      )
    },
    []
  )

  const settingsBridge = React.useMemo<PetSettingsBridge | null>(() => {
    if (!settingsSnapshot) {
      return null
    }

    return {
      dispatch: settingsDispatch,
      snapshot: settingsSnapshot,
    }
  }, [settingsDispatch, settingsSnapshot])

  const close = React.useCallback(() => {
    setPendingOpenView(null)
    settingsWindowBridge.close()
  }, [settingsWindowBridge.close])

  const open = React.useCallback(
    (view: PetSettingsView = settingsSnapshot?.activeView ?? targetView) => {
      setTargetView(view)
      setPendingOpenView(view)
    },
    [settingsSnapshot?.activeView, targetView]
  )

  const setOpen = React.useCallback(
    (openValue: boolean, view?: PetSettingsView) => {
      if (openValue) {
        open(view)
        return
      }
      close()
    },
    [close, open]
  )

  React.useEffect(() => {
    if (!pendingOpenView || !settingsSnapshot) {
      return
    }

    if (settingsSnapshot.activeView !== pendingOpenView) {
      settingsDispatch({ type: "set-active-view", view: pendingOpenView })
      return
    }

    settingsWindowBridge.open()
    setPendingOpenView(null)
  }, [
    pendingOpenView,
    settingsDispatch,
    settingsSnapshot,
    settingsWindowBridge.open,
  ])

  const contextValue = React.useMemo<PetSettingsWindowContextValue>(
    () => ({
      isOpen: pendingOpenView !== null || settingsWindowBridge.isOpen,
      open,
      setOpen,
    }),
    [open, pendingOpenView, setOpen, settingsWindowBridge.isOpen]
  )
  const fallbackOpen =
    settingsWindowBridge.isOpen && !settingsWindowBridge.useNativeWindow

  return (
    <PetSettingsWindowContext.Provider value={contextValue}>
      {children}
      <PetSettingsContent
        active={pendingOpenView !== null || settingsWindowBridge.isOpen}
        initialView={targetView}
        onBridgeChange={handleSettingsBridgeChange}
        onClose={close}
        renderSurface={false}
      />
      <Dialog
        open={fallbackOpen}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
      >
        <DialogContent className="border-0 bg-transparent p-0 shadow-none sm:max-w-none">
          <DialogHeader>
            <DialogTitle className="sr-only">
              <Trans>AgentHTML settings</Trans>
            </DialogTitle>
            <DialogDescription className="sr-only">
              <Trans>
                Agent-HTML settings for Codex connection and agent capabilities.
              </Trans>
            </DialogDescription>
          </DialogHeader>
          {settingsBridge ? (
            <PetSettingsSurface bridge={settingsBridge} />
          ) : null}
        </DialogContent>
      </Dialog>
    </PetSettingsWindowContext.Provider>
  )
}

function noopSettingsDispatch() {}
