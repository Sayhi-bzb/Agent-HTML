import * as React from "react"

import { artifactBundleUrl } from "../api/api"
import { BlockOverlayLayer, useBlockOverlays } from "../overlay/block-overlay"
import { GuardIssueList, HostStatusMessage } from "./status-surface"
import { ScrollArea } from "#agent-html-playground/components/ui/scroll-area"
import type { ArtifactBlock, ArtifactModule, GuardIssue } from "../host-contracts"
import { HostSurfaceSkeleton } from "../ui/surface-skeleton"

export function ArtifactSurface({
  activeFilePath,
  blocks,
  artifactCount,
  artifactsLoading,
  guardIssues,
  loadError,
}: {
  activeFilePath: string | null
  blocks?: ArtifactBlock[]
  artifactCount: number
  artifactsLoading: boolean
  guardIssues: GuardIssue[]
  loadError: string | null
}) {
  const [artifactLoading, setArtifactLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [mountedFilePath, setMountedFilePath] = React.useState<string | null>(
    null
  )
  const artifactRootRef = React.useRef<HTMLDivElement | null>(null)
  const overlayRootRef = React.useRef<HTMLDivElement | null>(null)
  const unmountArtifactRef = React.useRef<(() => void) | null>(null)
  const { measureBlocks, overlays, scheduleGeometryUpdate, setOverlays } =
    useBlockOverlays(overlayRootRef)

  React.useEffect(() => {
    if (!activeFilePath || !artifactRootRef.current) {
      setArtifactLoading(false)
      return
    }

    if (mountedFilePath === activeFilePath) {
      measureBlocks()
      return
    }

    unmountArtifactRef.current?.()
    unmountArtifactRef.current = null
    artifactRootRef.current.innerHTML = ""
    setMountedFilePath(null)
    setOverlays([])
    setError(null)
    setArtifactLoading(true)

    let cancelled = false

    void import(artifactBundleUrl(activeFilePath)).then(
      (module: ArtifactModule) => {
        if (cancelled || !artifactRootRef.current) {
          return
        }

        unmountArtifactRef.current = module.mount(artifactRootRef.current)
        setMountedFilePath(activeFilePath)
        setArtifactLoading(false)
        scheduleGeometryUpdate()
      },
      (loadError: unknown) => {
        setArtifactLoading(false)
        setError(
          loadError instanceof Error ? loadError.message : String(loadError)
        )
      }
    )

    return () => {
      cancelled = true
    }
  }, [
    activeFilePath,
    measureBlocks,
    mountedFilePath,
    scheduleGeometryUpdate,
    setOverlays,
  ])

  const showSkeleton = shouldShowArtifactSkeleton({
    activeFilePath,
    artifactCount,
    artifactLoading,
    artifactsLoading,
    error,
    loadError,
    mountedFilePath,
  })

  return (
    <main className="canvas-surface-root">
      <ScrollArea className="canvas-surface-scroll">
        <div
          className="canvas-surface-frame"
          onTransitionEnd={scheduleGeometryUpdate}
          ref={overlayRootRef}
        >
          <GuardIssueList issues={guardIssues} />
          {loadError || error ? (
            <HostStatusMessage
              message={loadError ?? error ?? ""}
              title="Artifact unavailable"
            />
          ) : showSkeleton ? (
            <HostSurfaceSkeleton blocks={blocks} />
          ) : artifactCount === 0 ? (
            <HostStatusMessage
              message="Create an agent-html/artifacts/*.artifact.tsx file to preview it here."
              title="No artifacts found"
            />
          ) : null}
          <div ref={artifactRootRef} />
          <BlockOverlayLayer overlays={overlays} />
        </div>
      </ScrollArea>
    </main>
  )
}

export function shouldShowArtifactSkeleton({
  activeFilePath,
  artifactCount,
  artifactLoading,
  artifactsLoading,
  error,
  loadError,
  mountedFilePath,
}: {
  activeFilePath: string | null
  artifactCount: number
  artifactLoading: boolean
  artifactsLoading: boolean
  error: string | null
  loadError: string | null
  mountedFilePath: string | null
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

  return artifactLoading && mountedFilePath !== activeFilePath
}

