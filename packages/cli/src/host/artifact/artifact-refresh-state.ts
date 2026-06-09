import type { Artifact } from "../host-contracts"

export function resolveArtifactRefreshState({
  artifacts,
  currentFilePath,
  pendingFilePath,
  storedFilePath,
}: {
  artifacts: Artifact[]
  currentFilePath: string | null
  pendingFilePath: string | null
  storedFilePath: string | null
}) {
  const artifactFilePaths = new Set(
    artifacts.map((artifact) => artifact.filePath)
  )
  const pendingReady = Boolean(
    pendingFilePath && artifactFilePaths.has(pendingFilePath)
  )

  if (pendingFilePath && pendingReady) {
    return {
      activeFilePath: pendingFilePath,
      pendingReady,
    }
  }

  if (currentFilePath && artifactFilePaths.has(currentFilePath)) {
    return {
      activeFilePath: currentFilePath,
      pendingReady,
    }
  }

  return {
    activeFilePath: storedFilePath ?? artifacts[0]?.filePath ?? null,
    pendingReady,
  }
}
