export function shouldShowArtifactSkeleton({
  activeFilePath,
  artifactCount,
  artifactsLoading,
  error,
  loadError,
  mountedFilePath,
  status,
}: {
  activeFilePath: string | null
  artifactCount: number
  artifactsLoading: boolean
  error: string | null
  loadError: string | null
  mountedFilePath: string | null
  status: "idle" | "loading" | "mounted" | "failed" | "disposing"
}) {
  if (loadError || error) {
    return false
  }

  if (artifactsLoading) {
    return true
  }

  if (artifactCount === 0 || !activeFilePath) {
    return false
  }

  return (
    (status === "loading" || status === "disposing") &&
    mountedFilePath !== activeFilePath
  )
}

export function shouldBlockArtifactWithError({
  activeFilePath,
  error,
  loadError,
  mountedFilePath,
}: {
  activeFilePath: string | null
  error: string | null
  loadError: string | null
  mountedFilePath: string | null
}) {
  if (loadError) {
    return true
  }

  if (!error) {
    return false
  }

  return mountedFilePath !== activeFilePath
}
