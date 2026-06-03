import * as React from "react"

import { artifactBundleUrl } from "./api"
import { BlockOverlayLayer, useBlockOverlays } from "./block-overlay"
import { GuardIssueList, HostStatusMessage } from "./status-surface"
import type {
  ArtifactModule,
  GuardIssue,
  PromptTarget,
} from "./host-contracts"

export function ArtifactSurface({
  activeFilePath,
  artifactCount,
  guardIssues,
  loadError,
  onMessageBlock,
}: {
  activeFilePath: string | null
  artifactCount: number
  guardIssues: GuardIssue[]
  loadError: string | null
  onMessageBlock: (target: PromptTarget) => void
}) {
  const [error, setError] = React.useState<string | null>(null)
  const [mountedFilePath, setMountedFilePath] = React.useState<string | null>(
    null
  )
  const artifactRootRef = React.useRef<HTMLDivElement | null>(null)
  const surfaceRef = React.useRef<HTMLElement | null>(null)
  const unmountArtifactRef = React.useRef<(() => void) | null>(null)
  const { collectBlocks, overlays, setOverlays } = useBlockOverlays(surfaceRef)

  React.useEffect(() => {
    if (!activeFilePath || !artifactRootRef.current) {
      return
    }

    if (mountedFilePath === activeFilePath) {
      collectBlocks()
      return
    }

    unmountArtifactRef.current?.()
    unmountArtifactRef.current = null
    artifactRootRef.current.innerHTML = ""
    setMountedFilePath(null)
    setOverlays([])
    setError(null)

    let cancelled = false

    void import(artifactBundleUrl(activeFilePath)).then(
      (module: ArtifactModule) => {
        if (cancelled || !artifactRootRef.current) {
          return
        }

        unmountArtifactRef.current = module.mount(artifactRootRef.current)
        setMountedFilePath(activeFilePath)
        window.requestAnimationFrame(collectBlocks)
      },
      (loadError: unknown) => {
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
    collectBlocks,
    mountedFilePath,
    setOverlays,
  ])

  return (
    <main
      className="relative flex min-h-svh flex-1 overflow-hidden bg-background"
      ref={surfaceRef}
    >
      <div className="h-svh min-w-0 flex-1 overflow-auto p-4">
        <GuardIssueList issues={guardIssues} />
        {loadError || error ? (
          <HostStatusMessage
            message={loadError ?? error ?? ""}
            title="Artifact unavailable"
          />
        ) : artifactCount === 0 ? (
          <HostStatusMessage
            message="Create a .agent-html/artifacts/*.agent.tsx file to preview it here."
            title="No artifacts found"
          />
        ) : null}
        <div ref={artifactRootRef} />
      </div>
      <BlockOverlayLayer onMessageBlock={onMessageBlock} overlays={overlays} />
    </main>
  )
}
