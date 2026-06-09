import * as React from "react"

import {
  formatArtifactRuntimeError,
  useArtifactRuntime,
} from "./artifact-runtime"
import {
  shouldBlockArtifactWithError,
  shouldShowArtifactSkeleton,
} from "./artifact-surface-state"
import { BlockOverlayLayer } from "../overlay/block-overlay"
import { useBlockOverlays } from "../overlay/block-overlay-geometry"
import { GuardIssueList, HostStatusMessage } from "./status-surface"
import { getHumanVisibleGuardIssues } from "../guard-visibility"
import { useHostI18n } from "../i18n/host-i18n"
import { ScrollArea } from "#agent-html-playground/components/ui/scroll-area"
import type { ArtifactBlock, GuardIssue } from "../host-contracts"
import { HostSurfaceSkeleton } from "../ui/surface-skeleton"

export function ArtifactSurface({
  activeFilePath,
  blocks,
  artifactCount,
  artifactRegistryVersion,
  artifactsLoading,
  guardIssues,
  loadError,
}: {
  activeFilePath: string | null
  blocks?: ArtifactBlock[]
  artifactCount: number
  artifactRegistryVersion: number
  artifactsLoading: boolean
  guardIssues: GuardIssue[]
  loadError: string | null
}) {
  const { t } = useHostI18n()
  const overlayRootRef = React.useRef<HTMLDivElement | null>(null)
  const { measureBlocks, overlays, scheduleGeometryUpdate, setOverlays } =
    useBlockOverlays(overlayRootRef)
  const { runtime, setArtifactElement } = useArtifactRuntime({
    activeFilePath,
    artifactRegistryVersion,
    onMounted: scheduleGeometryUpdate,
  })
  const error = runtime.error ? formatArtifactRuntimeError(runtime.error) : null
  const blocksCurrentArtifact = shouldBlockArtifactWithError({
    activeFilePath,
    error,
    loadError,
    mountedFilePath: runtime.mountedFilePath,
  })

  React.useEffect(() => {
    setOverlays([])
  }, [activeFilePath, setOverlays])

  React.useEffect(() => {
    if (runtime.status === "mounted") {
      measureBlocks()
    }
  }, [measureBlocks, runtime.status])

  const showSkeleton = shouldShowArtifactSkeleton({
    activeFilePath,
    artifactCount,
    artifactsLoading,
    error,
    loadError,
    mountedFilePath: runtime.mountedFilePath,
    status: runtime.status,
  })

  return (
    <main className="canvas-surface-root">
      <ScrollArea className="canvas-surface-scroll">
        <div
          className="canvas-surface-frame"
          onTransitionEnd={scheduleGeometryUpdate}
          ref={overlayRootRef}
        >
          <GuardIssueList issues={getHumanVisibleGuardIssues(guardIssues)} />
          {loadError || blocksCurrentArtifact ? (
            <HostStatusMessage
              message={loadError ?? error ?? ""}
              title={t("artifact.unavailable")}
            />
          ) : error ? (
            <HostStatusMessage
              message={error}
              title={t("artifact.loadIssue")}
            />
          ) : showSkeleton ? (
            <HostSurfaceSkeleton blocks={blocks} />
          ) : artifactCount === 0 ? (
            <HostStatusMessage
              message={t("artifact.noArtifactsMessage")}
              title={t("artifact.noArtifactsTitle")}
            />
          ) : null}
          <div ref={setArtifactElement} />
          <BlockOverlayLayer overlays={overlays} />
        </div>
      </ScrollArea>
    </main>
  )
}


