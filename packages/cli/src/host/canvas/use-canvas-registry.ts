import * as React from "react"

import { fetchCanvases } from "../api/api"
import type { CanvasEntry } from "../host-contracts"

export const canvasesUpdatedEventName = "agent-html:canvases-updated"

export function useCanvasRegistry() {
  const [canvases, setCanvases] = React.useState<CanvasEntry[]>([])
  const [canvasRegistryVersion, setCanvasRegistryVersion] = React.useState(0)
  const [canvasesLoading, setCanvasesLoading] = React.useState(true)
  const [canvasLoadError, setCanvasLoadError] = React.useState<string | null>(
    null
  )

  const refreshCanvases = React.useCallback(async () => {
    try {
      const data = await fetchCanvases()
      setCanvases(data.canvases ?? [])
      setCanvasRegistryVersion(data.version ?? 0)
      setCanvasLoadError(null)
    } catch (error) {
      setCanvasLoadError(error instanceof Error ? error.message : String(error))
    } finally {
      setCanvasesLoading(false)
    }
  }, [])

  React.useEffect(() => {
    queueMicrotask(() => void refreshCanvases())
  }, [refreshCanvases])

  React.useEffect(() => {
    if (!import.meta.hot) return
    const onCanvasesUpdated = () => void refreshCanvases()
    import.meta.hot.on(canvasesUpdatedEventName, onCanvasesUpdated)
    return () =>
      import.meta.hot?.off?.(canvasesUpdatedEventName, onCanvasesUpdated)
  }, [refreshCanvases])

  return {
    canvasLoadError,
    canvasRegistryVersion,
    canvases,
    canvasesLoading,
    refreshCanvases,
  }
}
