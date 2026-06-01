import * as React from "react"

import { ScrollArea } from "@/app/shared/ui/scroll-area"
import { Skeleton } from "@/app/shared/ui/skeleton"
import type { GalleryViewId } from "@/app/gallery/views"
import type {
  EnabledGalleryComponentTags,
  GalleryComponentMarketFilters,
} from "@/app/gallery/component-market-catalog"

export function preloadGalleryWorkspaceSurface() {
  void import("@/app/gallery/workspace-surface")
}

export function preloadGalleryComponentMarketView() {
  void import("@/app/gallery/component-market-view")
}

const GalleryWorkspaceSurface = React.lazy(() =>
  import("@/app/gallery/workspace-surface").then((module) => ({
    default: module.GalleryWorkspaceSurface,
  }))
)

const GalleryComponentMarketView = React.lazy(() =>
  import("@/app/gallery/component-market-view").then((module) => ({
    default: module.GalleryComponentMarketView,
  }))
)

export function GalleryPanel({
  activeViewId,
  componentMarketFilters,
  componentMarketSearchQuery,
  enabledComponentTags,
  onEnabledComponentTagsChange,
  onComponentMarketFiltersChange,
}: {
  activeViewId: GalleryViewId
  componentMarketFilters: GalleryComponentMarketFilters
  componentMarketSearchQuery: string
  enabledComponentTags: EnabledGalleryComponentTags
  onEnabledComponentTagsChange: (tags: EnabledGalleryComponentTags) => void
  onComponentMarketFiltersChange: (filters: GalleryComponentMarketFilters) => void
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col p-4 md:p-6">
          <React.Suspense fallback={<GalleryPanelFallback />}>
            {activeViewId === "theme" ? (
              <GalleryWorkspaceSurface />
            ) : activeViewId === "components" ? (
              <GalleryComponentMarketView
                enabledTags={enabledComponentTags}
                filters={componentMarketFilters}
                searchQuery={componentMarketSearchQuery}
                onEnabledTagsChange={onEnabledComponentTagsChange}
                onFiltersChange={onComponentMarketFiltersChange}
              />
            ) : (
              <GalleryMarketPlaceholder viewId={activeViewId} />
            )}
          </React.Suspense>
        </div>
      </ScrollArea>
    </div>
  )
}

function GalleryPanelFallback() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          className="flex min-h-40 flex-col rounded-lg border bg-card p-3"
          data-selection="none"
          key={index}
        >
          <div className="flex items-start gap-3">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

function GalleryMarketPlaceholder({
  viewId,
}: {
  viewId: Exclude<GalleryViewId, "theme">
}) {
  const copy =
    viewId === "components"
      ? {
          eyebrow: "Component Market",
          title: "Component packs are next",
          body: "This view is reserved for browsing, inspecting, and installing reusable artifact component sets.",
        }
      : {
          eyebrow: "Pet Market",
          title: "Companion assets are next",
          body: "This view is reserved for browsing, previewing, and installing workspace pet assets.",
        }

  return (
    <section className="grid min-h-[24rem] place-items-center rounded-xl border bg-background p-8 text-center text-foreground">
      <div className="max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {copy.eyebrow}
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy.body}
        </p>
      </div>
    </section>
  )
}
