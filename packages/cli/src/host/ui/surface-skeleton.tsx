import { Skeleton } from "#agent-html-playground/components/ui/skeleton"
import type { ArtifactBlock } from "../host-contracts"

const maxSkeletonBlocks = 6

export function HostSurfaceSkeleton({
  blocks = [],
}: {
  blocks?: ArtifactBlock[]
}) {
  const visibleBlocks = blocks.slice(0, maxSkeletonBlocks)
  const hiddenBlockCount = Math.max(0, blocks.length - visibleBlocks.length)

  return (
    <div
      aria-hidden="true"
      className="canvas-artifact-skeleton"
      data-agent-html-artifact-skeleton="true"
    >
      <Skeleton className="canvas-artifact-skeleton-kicker" />
      <Skeleton className="canvas-artifact-skeleton-title" />
      <Skeleton className="canvas-artifact-skeleton-line canvas-artifact-skeleton-line-wide" />
      <Skeleton className="canvas-artifact-skeleton-line" />
      <div className="canvas-artifact-skeleton-grid">
        <Skeleton className="canvas-artifact-skeleton-card" />
        <Skeleton className="canvas-artifact-skeleton-card" />
      </div>
      {visibleBlocks.length > 0 ? (
        <div className="canvas-artifact-skeleton-block-list">
          {visibleBlocks.map((block, index) => (
            <div
              className="canvas-artifact-skeleton-block"
              data-agent-html-artifact-skeleton-block-id={block.id}
              data-agent-html-artifact-skeleton-block-title={block.title}
              key={block.id}
            >
              <Skeleton className="canvas-artifact-skeleton-block-title" />
              <Skeleton className="canvas-artifact-skeleton-block-line canvas-artifact-skeleton-block-line-wide" />
              <Skeleton className="canvas-artifact-skeleton-block-line" />
              <Skeleton
                className="canvas-artifact-skeleton-block-body"
                data-variant={index % 2 === 0 ? "wide" : "compact"}
              />
            </div>
          ))}
          {hiddenBlockCount > 0 ? (
            <Skeleton className="canvas-artifact-skeleton-block-overflow" />
          ) : null}
        </div>
      ) : (
        <>
          <Skeleton className="canvas-artifact-skeleton-block" />
          <Skeleton className="canvas-artifact-skeleton-block canvas-artifact-skeleton-block-short" />
        </>
      )}
    </div>
  )
}
