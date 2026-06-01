import * as React from "react"

import {
  getWorkspacePetHostSnapshot,
  subscribeWorkspacePetHost,
} from "@/app/pet/host/pet-host-store"
import { schedulePostReadyTask } from "@/agent-html/runtime/scheduling/post-ready-task-scheduler"

const LazyWorkspacePetHostSessionRoot = React.lazy(() =>
  import("@/app/pet/host/workspace-pet-host-session").then((module) => ({
    default: module.WorkspacePetHostSessionRoot,
  }))
)

export function WorkspacePetHost() {
  const snapshot = React.useSyncExternalStore(
    subscribeWorkspacePetHost,
    getWorkspacePetHostSnapshot,
    getWorkspacePetHostSnapshot
  )
  const [canLoadSession, setCanLoadSession] = React.useState(false)

  React.useEffect(() => {
    if (!snapshot.enabled) {
      setCanLoadSession(false)
      return
    }

    const scheduledLoad = schedulePostReadyTask({
      delay: 1400,
      id: "workspace-pet-host-session",
      idleTimeout: 2400,
      priority: "ambient",
      run: () => {
        setCanLoadSession(true)
      },
    })

    return () => {
      scheduledLoad.cancel()
    }
  }, [snapshot.enabled])

  if (!snapshot.enabled || !canLoadSession) {
    return null
  }

  return (
    <React.Suspense fallback={null}>
      <LazyWorkspacePetHostSessionRoot />
    </React.Suspense>
  )
}
