import * as React from "react"

import {
  getWorkspacePetHostSnapshot,
  subscribeWorkspacePetHost,
} from "@/app/pet/host/pet-host-store"

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

  return (
    <React.Suspense fallback={null}>
      <LazyWorkspacePetHostSessionRoot />
    </React.Suspense>
  )
}
