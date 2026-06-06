import * as React from "react"

import {
  PetSettingsSurface,
  type PetSettingsBridge,
} from "@/app/pet/host/pet-settings-content"
import {
  dispatchPetSettingsNativeAction,
  readPetSettingsNativeSnapshotCache,
  subscribePetSettingsNativeSnapshots,
  type PetSettingsNativeSnapshot,
} from "@/app/pet/host/pet-settings-native-bridge"
import { hideWindow } from "@/app/shared/lib/window-controls"
import {
  WindowControls,
  WindowChromeFrame,
  WindowTitlebar,
} from "@/app/shared/ui/window-chrome"

export function PetSettingsWindowApp() {
  const [snapshot, setSnapshot] =
    React.useState<PetSettingsNativeSnapshot | null>(
      readPetSettingsNativeSnapshotCache
    )

  React.useEffect(() => {
    let isMounted = true
    let cleanup: (() => void) | undefined

    void subscribePetSettingsNativeSnapshots((nextSnapshot) => {
      if (isMounted) {
        setSnapshot(nextSnapshot)
      }
    }).then((unlisten) => {
      cleanup = unlisten
    })

    return () => {
      isMounted = false
      cleanup?.()
    }
  }, [])

  if (!snapshot) {
    return (
      <WindowChromeFrame className="items-center justify-center px-6 text-center text-xs text-muted-foreground">
        Waiting for settings state.
      </WindowChromeFrame>
    )
  }

  const bridge = {
    dispatch: (action) => {
      if (action.type === "close") {
        void dispatchPetSettingsNativeAction(action)
        void hideWindow()
        return
      }
      void dispatchPetSettingsNativeAction(action)
    },
    snapshot,
  } satisfies PetSettingsBridge
  const handleCloseWindow = () => {
    bridge.dispatch({ type: "close" })
  }

  return (
    <WindowChromeFrame>
      <WindowTitlebar className="border-b bg-muted/30 text-foreground">
        <div className="flex h-12 w-full min-w-0 items-center gap-3 px-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-medium leading-5">
              AgentHTML settings
            </h1>
          </div>
          <WindowControls className="ml-auto" onClose={handleCloseWindow} />
        </div>
      </WindowTitlebar>
      <PetSettingsSurface
        bridge={bridge}
        className="min-h-0 w-full flex-1 rounded-none border-0 shadow-none"
        renderHeader={false}
      />
    </WindowChromeFrame>
  )
}
