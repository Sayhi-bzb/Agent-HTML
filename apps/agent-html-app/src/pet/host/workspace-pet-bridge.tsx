import * as React from "react"

import {
  getWorkspacePetHostSnapshot,
  subscribeWorkspacePetHost,
} from "@/app/pet/host/pet-host-store"
import {
  PET_WINDOW_COMMAND_EVENT,
  PET_WINDOW_LABEL,
  PET_WINDOW_READY_EVENT,
  PET_WINDOW_STATE_EVENT,
  type PetWindowCommand,
  type PetWindowState,
} from "@/app/pet/host/pet-window-events"
import { ensurePetWindow } from "@/app/pet/host/pet-window"
import { WorkspacePetHost } from "@/app/pet/host/workspace-pet-host"
import { isDesktopRuntime } from "@/app/shared/lib/window-controls"

function toPetWindowState(): PetWindowState {
  const snapshot = getWorkspacePetHostSnapshot()

  return {
    draftScope: snapshot.draftScope,
    enabled: snapshot.enabled,
    presence: snapshot.presence,
  }
}

async function emitPetWindowState(state: PetWindowState) {
  if (!isDesktopRuntime()) {
    return
  }

  const { emitTo } = await import("@tauri-apps/api/event")
  await emitTo(PET_WINDOW_LABEL, PET_WINDOW_STATE_EVENT, state)
}

export function WorkspacePetBridge() {
  const snapshot = React.useSyncExternalStore(
    subscribeWorkspacePetHost,
    getWorkspacePetHostSnapshot,
    getWorkspacePetHostSnapshot
  )
  const snapshotRef = React.useRef(snapshot)
  const [useInAppHost, setUseInAppHost] = React.useState(
    () => !isDesktopRuntime()
  )

  React.useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  React.useEffect(() => {
    if (!isDesktopRuntime()) {
      return undefined
    }

    let isDisposed = false
    let unlistenCommand: (() => void) | undefined
    let unlistenReady: (() => void) | undefined

    async function attachListeners() {
      const { listen } = await import("@tauri-apps/api/event")
      if (isDisposed) {
        return
      }

      unlistenCommand = await listen<PetWindowCommand>(
        PET_WINDOW_COMMAND_EVENT,
        (event) => {
          if (event.payload.type !== "send-prompt") {
            return
          }

          snapshotRef.current.onPromptSubmit?.({
            prompt: event.payload.prompt,
            target: {
              kind: "document",
            },
          })
        }
      )
      unlistenReady = await listen(PET_WINDOW_READY_EVENT, () => {
        void emitPetWindowState(toPetWindowState())
      })
    }

    void attachListeners()

    return () => {
      isDisposed = true
      unlistenCommand?.()
      unlistenReady?.()
    }
  }, [])

  React.useEffect(() => {
    if (!isDesktopRuntime()) {
      setUseInAppHost(true)
      return
    }

    let isDisposed = false
    const state = toPetWindowState()

    async function syncPetWindow() {
      if (!snapshot.enabled) {
        setUseInAppHost(false)
        await emitPetWindowState(state)
        return
      }

      try {
        await ensurePetWindow()
        if (isDisposed) {
          return
        }
        setUseInAppHost(false)
        await emitPetWindowState(state)
      } catch (error) {
        console.warn("Unable to open pet window; using in-app pet.", error)
        if (!isDisposed) {
          setUseInAppHost(true)
        }
      }
    }

    void syncPetWindow()

    return () => {
      isDisposed = true
    }
  }, [snapshot])

  return useInAppHost ? <WorkspacePetHost /> : null
}
