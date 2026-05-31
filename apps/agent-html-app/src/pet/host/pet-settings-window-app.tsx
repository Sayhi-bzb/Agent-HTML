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

  return (
    <WindowChromeFrame>
      <PetSettingsSurface
        bridge={bridge}
        className="h-full min-h-0 w-full rounded-none border-0 shadow-none"
        headerSlot={(header) => (
          <WindowTitlebar className="bg-muted/30 text-foreground">
            {header}
          </WindowTitlebar>
        )}
      />
    </WindowChromeFrame>
  )
}
