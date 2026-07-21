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
import { HostStatusMessage, ValidationIssueList } from "./status-surface"
import { useHostI18n } from "../i18n/host-i18n"
import { ScrollArea } from "#agent-html-playground/components/ui/scroll-area"
import {
  TableOfContents,
  TableOfContentsList,
  useScrollSpy,
} from "../ui/table-of-contents"
import type { ArtifactBlock, CanvasDiagnostic } from "../host-contracts"
import { HostSurfaceSkeleton } from "../ui/surface-skeleton"

export function ArtifactSurface({
  activeFilePath,
  blocks,
  artifactCount,
  artifactRegistryVersion,
  artifactsLoading,
  diagnostics,
  loadError,
}: {
  activeFilePath: string | null
  blocks?: ArtifactBlock[]
  artifactCount: number
  artifactRegistryVersion: number
  artifactsLoading: boolean
  diagnostics: CanvasDiagnostic[]
  loadError: string | null
}) {
  const { t } = useHostI18n()
  const overlayRootRef = React.useRef<HTMLDivElement | null>(null)
  const tocScrollHideTimeoutRef = React.useRef<number | null>(null)
  const [scrollViewport, setScrollViewport] =
    React.useState<HTMLElement | null>(null)
  const [tocVisibleByScroll, setTocVisibleByScroll] = React.useState(false)
  const tocItems = React.useMemo(
    () => blocks?.map((block) => ({
      depth: 2,
      id: block.id,
      title: block.title,
    })) ?? [],
    [blocks]
  )
  const activeTocId = useScrollSpy(
    tocItems.map((item) => item.id),
    {
      root: scrollViewport,
      rootMargin: "-24px 0px -80% 0px",
    }
  )
  const setScrollAreaElement = React.useCallback(
    (element: HTMLDivElement | null) => {
      setScrollViewport(
        element?.querySelector<HTMLElement>("[data-slot='scroll-area-viewport']") ??
          null
      )
    },
    []
  )

  React.useEffect(() => {
    if (!scrollViewport) {
      setTocVisibleByScroll(false)
      return
    }

    const clearHideTimeout = () => {
      if (tocScrollHideTimeoutRef.current === null) {
        return
      }

      window.clearTimeout(tocScrollHideTimeoutRef.current)
      tocScrollHideTimeoutRef.current = null
    }

    const scheduleHide = () => {
      clearHideTimeout()
      tocScrollHideTimeoutRef.current = window.setTimeout(() => {
        setTocVisibleByScroll(false)
        tocScrollHideTimeoutRef.current = null
      }, 900)
    }

    const handleScroll = () => {
      setTocVisibleByScroll(true)
      scheduleHide()
    }

    scrollViewport.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      clearHideTimeout()
      scrollViewport.removeEventListener("scroll", handleScroll)
      setTocVisibleByScroll(false)
    }
  }, [scrollViewport])

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
  const showsPreviousArtifact = Boolean(
    runtime.mountedFilePath && runtime.mountedFilePath !== activeFilePath
  )

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
      {tocItems.length > 1 ? (
        <aside
          className="canvas-artifact-toc-layer"
          data-scroll-visible={tocVisibleByScroll ? "" : undefined}
        >
          <TableOfContents activeId={activeTocId} items={tocItems}>
            <TableOfContentsList />
          </TableOfContents>
        </aside>
      ) : null}
      <ScrollArea className="canvas-surface-scroll" ref={setScrollAreaElement}>
        <div
          className="canvas-surface-frame"
          onTransitionEnd={scheduleGeometryUpdate}
          ref={overlayRootRef}
        >
          <ValidationIssueList diagnostics={diagnostics} />
          {loadError || blocksCurrentArtifact ? (
            <HostStatusMessage
              context={
                showsPreviousArtifact
                  ? t("artifact.previousVisible")
                  : undefined
              }
              details={loadError ?? error ?? undefined}
              detailsLabel={t("artifact.technicalDetails")}
              message={t("artifact.unavailableMessage")}
              title={t("artifact.unavailable")}
            />
          ) : error ? (
            <HostStatusMessage
              details={error}
              detailsLabel={t("artifact.technicalDetails")}
              message={t("artifact.loadIssueMessage")}
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


