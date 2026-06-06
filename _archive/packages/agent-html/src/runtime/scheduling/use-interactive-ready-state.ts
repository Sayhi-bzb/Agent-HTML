import * as React from "react"

import {
  getInteractiveReadyState,
  subscribeInteractiveReadyState,
} from "@/agent-html/runtime/scheduling/post-ready-task-scheduler"

export function useInteractiveReadyState() {
  return React.useSyncExternalStore(
    subscribeInteractiveReadyState,
    getInteractiveReadyState,
    getInteractiveReadyState
  )
}
