import * as React from "react"

import {
  deleteArtifact,
  fetchArtifacts,
  renameArtifact,
} from "../api/api"
import { readCanvasHostPreferences } from "../preferences/canvas-host-preferences"
import { resolveArtifactRefreshState } from "./artifact-refresh-state"
import type {
  Artifact,
  GuardIssue,
} from "../host-contracts"

export const artifactsUpdatedEventName = "agent-html:artifacts-updated"

export function useArtifactRegistry({
  getPendingFilePath,
  onPendingArtifactReady,
  onSelectArtifactMode,
}: {
  getPendingFilePath: () => string | null
  onPendingArtifactReady: () => void
  onSelectArtifactMode: () => void
}) {
  const [activeFilePath, setActiveFilePath] = React.useState<string | null>(null)
  const [artifacts, setArtifacts] = React.useState<Artifact[]>([])
  const [artifactRegistryVersion, setArtifactRegistryVersion] = React.useState(0)
  const [guardIssues, setGuardIssues] = React.useState<GuardIssue[]>([])
  const [artifactsLoading, setArtifactsLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<string | null>(null)

  const activeArtifact =
    artifacts.find((artifact) => artifact.filePath === activeFilePath) ??
    artifacts[0] ??
    null
  const resolvedActiveFilePath = activeFilePath ?? activeArtifact?.filePath ?? null
  const activeIssues = resolvedActiveFilePath
    ? guardIssues.filter((issue) => issue.filePath === resolvedActiveFilePath)
    : []

  const refreshArtifacts = React.useCallback(async ({
    currentFilePath = activeFilePath,
  }: {
    currentFilePath?: string | null
  } = {}) => {
    try {
      const data = await fetchArtifacts()
      const pendingFilePath = getPendingFilePath()
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
      setGuardIssues(data.guardIssues ?? [])
      setLoadError(null)
      setActiveFilePath(refreshState.activeFilePath)

      if (refreshState.pendingReady) {
        onPendingArtifactReady()
      }
    } finally {
      setArtifactsLoading(false)
    }
  }, [activeFilePath, getPendingFilePath, onPendingArtifactReady])

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

  const selectArtifact = React.useCallback((filePath: string) => {
    onSelectArtifactMode()
    setActiveFilePath(filePath)
  }, [onSelectArtifactMode])

  const renameExistingArtifact = React.useCallback(async ({
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
  }, [onSelectArtifactMode, refreshArtifacts])

  const deleteExistingArtifact = React.useCallback(async (filePath: string) => {
    await deleteArtifact({ filePath })
    setActiveFilePath((current) => (current === filePath ? null : current))
    await refreshArtifacts()
  }, [refreshArtifacts])

  return {
    activeArtifact,
    activeFilePath,
    activeIssues,
    artifactRegistryVersion,
    artifacts,
    artifactsLoading,
    deleteExistingArtifact,
    guardIssues,
    loadError,
    refreshArtifacts,
    renameExistingArtifact,
    resolvedActiveFilePath,
    selectArtifact,
  }
}
