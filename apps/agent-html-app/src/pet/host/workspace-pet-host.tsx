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

  if (!snapshot.enabled) {
    return null
  }

  return <WorkspacePetHostLoader scope={snapshot.draftScope ?? "workspace"} />
}

function WorkspacePetHostLoader({ scope }: { scope: string }) {
  const [canLoadSession, setCanLoadSession] = React.useState(false)

  React.useEffect(() => {
    const scheduledLoad = schedulePostReadyTask({
      delay: 1400,
      id: `workspace-pet-host-session:${scope}`,
      idleTimeout: 2400,
      priority: "ambient",
      run: () => {
        setCanLoadSession(true)
      },
    })

    return () => {
      scheduledLoad.cancel()
    }
  }, [scope])

  if (!canLoadSession) {
    return null
  }

  return (
    <React.Suspense fallback={null}>
      <LazyWorkspacePetHostSessionRoot />
    </React.Suspense>
  )
}
