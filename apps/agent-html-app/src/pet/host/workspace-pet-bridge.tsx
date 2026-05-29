import * as React from "react"

import {
  getWorkspacePetHostSnapshot,
  subscribeWorkspacePetHost,
} from "@/app/pet/host/pet-host-store"
import {
  PET_PANEL_STATE_EVENT,
  PET_PANEL_WINDOW_LABEL,
  PET_WINDOW_COMMAND_EVENT,
  PET_WINDOW_LABEL,
  PET_WINDOW_READY_EVENT,
  PET_WINDOW_STATE_EVENT,
  type PetWindowCommand,
  type PetWindowState,
} from "@/app/pet/host/pet-window-events"
import {
  ensurePetPanelWindow,
  ensurePetWindow,
} from "@/app/pet/host/pet-window"
import { WorkspacePetHost } from "@/app/pet/host/workspace-pet-host"
import { isDesktopRuntime } from "@/app/shared/lib/window-controls"

function toPetWindowState(): PetWindowState {
  const snapshot = getWorkspacePetHostSnapshot()

  return {
    draftScope: snapshot.draftScope,
    enabled: snapshot.enabled,
    presence: snapshot.presence,
    threads: snapshot.threads,
  }
}

async function emitPetWindowState(state: PetWindowState) {
  if (!isDesktopRuntime()) {
    return
  }

  const { emitTo } = await import("@tauri-apps/api/event")
  await emitTo(PET_WINDOW_LABEL, PET_WINDOW_STATE_EVENT, state)
}

async function syncPetPanelWindow(input: {
  mode: "message" | "threads" | null
  state: PetWindowState
}) {
  if (!isDesktopRuntime()) {
    return
  }

  const panelWindow = await ensurePetPanelWindow()
  if (!panelWindow) {
    return
  }

  const { emitTo } = await import("@tauri-apps/api/event")
  if (input.mode) {
    await panelWindow.show()
  } else {
    await panelWindow.hide()
  }
  await emitTo(PET_PANEL_WINDOW_LABEL, PET_PANEL_STATE_EVENT, input)
}

export function WorkspacePetBridge() {
  const snapshot = React.useSyncExternalStore(
    subscribeWorkspacePetHost,
    getWorkspacePetHostSnapshot,
    getWorkspacePetHostSnapshot
  )
  const snapshotRef = React.useRef(snapshot)
  const panelModeRef = React.useRef<"message" | "threads" | null>(null)
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
          if (event.payload.type === "open-panel") {
            panelModeRef.current = event.payload.panel
            void syncPetPanelWindow({
              mode: event.payload.panel,
              state: toPetWindowState(),
            })
            return
          }

          if (event.payload.type === "close-panel") {
            panelModeRef.current = null
            void syncPetPanelWindow({
              mode: null,
              state: toPetWindowState(),
            })
            return
          }

          if (event.payload.type === "send-prompt") {
            snapshotRef.current.onPromptSubmit?.({
              prompt: event.payload.prompt,
              target: {
                kind: "document",
              },
            })
            return
          }

          if (event.payload.type === "new-thread") {
            snapshotRef.current.onNewThread?.()
            return
          }

          if (event.payload.type === "resume-thread") {
            snapshotRef.current.onResumeThread?.(event.payload.threadId)
            return
          }

          if (event.payload.type === "rename-thread") {
            void snapshotRef.current.onRenameThread?.({
              name: event.payload.name,
              threadId: event.payload.threadId,
            })
          }
        }
      )
      unlistenReady = await listen(PET_WINDOW_READY_EVENT, () => {
        void emitPetWindowState(toPetWindowState())
        void syncPetPanelWindow({
          mode: panelModeRef.current,
          state: toPetWindowState(),
        })
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
        panelModeRef.current = null
        await syncPetPanelWindow({ mode: null, state })
        return
      }

      try {
        await ensurePetWindow()
        if (isDisposed) {
          return
        }
        setUseInAppHost(false)
        await emitPetWindowState(state)
        await syncPetPanelWindow({ mode: panelModeRef.current, state })
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
