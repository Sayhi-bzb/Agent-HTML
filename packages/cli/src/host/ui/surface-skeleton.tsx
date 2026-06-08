import { Skeleton } from "#agent-html-playground/components/ui/skeleton"

export function HostSurfaceSkeleton() {
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
      <Skeleton className="canvas-artifact-skeleton-block" />
      <Skeleton className="canvas-artifact-skeleton-block canvas-artifact-skeleton-block-short" />
    </div>
  )
}
