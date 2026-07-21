import * as React from "react"

import {
  deleteArtifact,
  fetchArtifacts,
  renameArtifact,
  renameArtifactTitle,
} from "../api/api"
import { readCanvasHostPreferences } from "../preferences/canvas-host-preferences"
import { resolveArtifactRefreshState } from "./artifact-refresh-state"
import type { Artifact, CanvasDiagnostic } from "../host-contracts"

export const artifactsUpdatedEventName = "agent-html:artifacts-updated"
export const pendingArtifactPollFailureLimit = 3
export const pendingArtifactPollIntervalMs = 1500

export function shouldPollPendingArtifact(pendingFilePath: string | null) {
  return Boolean(pendingFilePath)
}

export function startPendingArtifactPolling({
  clearIntervalFn,
  intervalMs = pendingArtifactPollIntervalMs,
  maxConsecutiveFailures = pendingArtifactPollFailureLimit,
  onPollingFailed,
  pendingFilePath,
  refresh,
  setIntervalFn,
}: {
  clearIntervalFn?: (
    intervalId: ReturnType<typeof globalThis.setInterval>
  ) => void
  intervalMs?: number
  maxConsecutiveFailures?: number
  onPollingFailed?: (error: string) => void
  pendingFilePath: string | null
  refresh: () => boolean | Promise<boolean>
  setIntervalFn?: (
    handler: () => void,
    timeout: number
  ) => ReturnType<typeof globalThis.setInterval>
}) {
  if (!shouldPollPendingArtifact(pendingFilePath)) {
    return () => {}
  }

  const scheduleInterval =
    setIntervalFn ?? globalThis.setInterval.bind(globalThis)
  const clearScheduledInterval =
    clearIntervalFn ?? globalThis.clearInterval.bind(globalThis)
  let consecutiveFailures = 0
  let stopped = false
  const stop = () => {
    if (stopped) {
      return
    }

    stopped = true
    if (intervalId !== undefined) {
      clearScheduledInterval(intervalId)
    }
  }
  const runRefresh = () => {
    let refreshResult: boolean | Promise<boolean>

    try {
      refreshResult = refresh()
    } catch (error: unknown) {
      refreshResult = Promise.reject(error)
    }

    void Promise.resolve(refreshResult)
      .then((ok) => {
        if (stopped) {
          return
        }

        if (ok === false) {
          consecutiveFailures += 1
        } else {
          consecutiveFailures = 0
        }

        if (consecutiveFailures >= maxConsecutiveFailures) {
          onPollingFailed?.(
            `Artifact registry polling failed ${consecutiveFailures} times.`
          )
          stop()
        }
      })
      .catch((error: unknown) => {
        if (stopped) {
          return
        }

        consecutiveFailures += 1
        if (consecutiveFailures >= maxConsecutiveFailures) {
          onPollingFailed?.(
            error instanceof Error ? error.message : String(error)
          )
          stop()
        }
      })
  }

  runRefresh()
  const intervalId = scheduleInterval(runRefresh, intervalMs)

  return stop
}

export async function refreshPendingArtifactRegistry({
  refreshArtifacts,
  setLoadError,
}: {
  refreshArtifacts: (options: { forceRefresh: true }) => Promise<void>
  setLoadError: (error: string) => void
}) {
  try {
    await refreshArtifacts({ forceRefresh: true })
    return true
  } catch (refreshError: unknown) {
    setLoadError(
      refreshError instanceof Error
        ? refreshError.message
        : String(refreshError)
    )
    return false
  }
}

export function useArtifactRegistry({
  onPendingArtifactReady,
  onPendingArtifactFailure,
  onSelectArtifactMode,
  pendingFilePath,
}: {
  onPendingArtifactReady: (event: { filePath: string }) => void
  onPendingArtifactFailure: (event: {
    error: string
    filePath: string
  }) => void
  onSelectArtifactMode: () => void
  pendingFilePath: string | null
}) {
  const [activeFilePath, setActiveFilePath] = React.useState<string | null>(
    null
  )
  const [artifacts, setArtifacts] = React.useState<Artifact[]>([])
  const [artifactRegistryVersion, setArtifactRegistryVersion] =
    React.useState(0)
  const [diagnostics, setDiagnostics] = React.useState<CanvasDiagnostic[]>([])
  const [artifactsLoading, setArtifactsLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const activeFilePathRef = React.useRef<string | null>(null)

  const activeArtifact =
    artifacts.find((artifact) => artifact.filePath === activeFilePath) ??
    artifacts[0] ??
    null
  const resolvedActiveFilePath =
    activeFilePath ?? activeArtifact?.filePath ?? null
  const activeDiagnostics = resolvedActiveFilePath
    ? diagnostics.filter(
        (diagnostic) => diagnostic.filePath === resolvedActiveFilePath
      )
    : []

  activeFilePathRef.current = activeFilePath

  const refreshArtifacts = React.useCallback(
    async ({
      currentFilePath = activeFilePathRef.current,
      forceRefresh = false,
    }: {
      currentFilePath?: string | null
      forceRefresh?: boolean
    } = {}) => {
      try {
        const data = await fetchArtifacts({ refresh: forceRefresh })
        const refreshState = resolveArtifactRefreshState({
          artifacts: data.artifacts ?? [],
          currentFilePath,
          pendingFilePath,
          storedFilePath: readCanvasHostPreferences({
            artifacts: data.artifacts,
          }).activeFilePath,
        })

        setArtifacts(data.artifacts ?? [])
        setArtifactRegistryVersion(data.version ?? 0)
        setDiagnostics(data.diagnostics ?? [])
        setLoadError(null)
        setActiveFilePath(refreshState.activeFilePath)

        if (refreshState.pendingReady && pendingFilePath) {
          onPendingArtifactReady({ filePath: pendingFilePath })
        }
      } finally {
        setArtifactsLoading(false)
      }
    },
    [onPendingArtifactReady, pendingFilePath]
  )

  React.useEffect(() => {
    void refreshArtifacts().catch((refreshError: unknown) => {
      setLoadError(
        refreshError instanceof Error
          ? refreshError.message
          : String(refreshError)
      )
    })
  }, [refreshArtifacts])

  React.useEffect(() => {
    if (!import.meta.hot) {
      return
    }

    const onArtifactsUpdated = () => {
      void refreshArtifacts().catch((refreshError: unknown) => {
        setLoadError(
          refreshError instanceof Error
            ? refreshError.message
            : String(refreshError)
        )
      })
    }

    import.meta.hot.on(artifactsUpdatedEventName, onArtifactsUpdated)

    return () => {
      import.meta.hot?.off(artifactsUpdatedEventName, onArtifactsUpdated)
    }
  }, [refreshArtifacts])

  React.useEffect(() => {
    if (!pendingFilePath) {
      return
    }

    const refreshPendingArtifact = () => {
      return refreshPendingArtifactRegistry({
        refreshArtifacts,
        setLoadError,
      })
    }

    return startPendingArtifactPolling({
      onPollingFailed: (error) =>
        onPendingArtifactFailure({ error, filePath: pendingFilePath }),
      pendingFilePath,
      refresh: refreshPendingArtifact,
    })
  }, [onPendingArtifactFailure, pendingFilePath, refreshArtifacts])

  const selectArtifact = React.useCallback(
    (filePath: string) => {
      onSelectArtifactMode()
      setActiveFilePath(filePath)
    },
    [onSelectArtifactMode]
  )

  const renameExistingArtifact = React.useCallback(
    async ({
      filePath,
      nextFileName,
    }: {
      filePath: string
      nextFileName: string
    }) => {
      const renamed = await renameArtifact({ filePath, nextFileName })
      onSelectArtifactMode()
      setActiveFilePath(renamed.filePath)
      await refreshArtifacts({ currentFilePath: renamed.filePath })
    },
    [onSelectArtifactMode, refreshArtifacts]
  )

  const renameExistingArtifactTitle = React.useCallback(
    async ({ filePath, title }: { filePath: string; title: string }) => {
      const renamed = await renameArtifactTitle({ filePath, title })
      await refreshArtifacts({ currentFilePath: activeFilePathRef.current })
      return renamed
    },
    [refreshArtifacts]
  )

  const deleteExistingArtifact = React.useCallback(
    async (filePath: string) => {
      await deleteArtifact({ filePath })
      setActiveFilePath((current) => (current === filePath ? null : current))
      await refreshArtifacts()
    },
    [refreshArtifacts]
  )

  return {
    activeArtifact,
    activeFilePath,
    activeDiagnostics,
    artifactRegistryVersion,
    artifacts,
    artifactsLoading,
    deleteExistingArtifact,
    diagnostics,
    loadError,
    refreshArtifacts,
    renameExistingArtifact,
    renameExistingArtifactTitle,
    resolvedActiveFilePath,
    selectArtifact,
  }
}
