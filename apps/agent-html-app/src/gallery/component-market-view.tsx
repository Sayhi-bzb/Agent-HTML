import * as React from "react"
import { PackageIcon } from "lucide-react"

import { GalleryComponentMarketCard } from "@/app/gallery/component-market-card"
import {
  galleryComponentMarketCatalog,
  filterGalleryComponentMarketComponents,
  getGalleryComponentMarketStatus,
  type EnabledGalleryComponentTags,
  type GalleryComponentMarketFilters,
  type GalleryComponentMarketItem,
} from "@/app/gallery/component-market-catalog"
import { buildGalleryComponentPromptMetrics } from "@/app/gallery/component-market-repository"

export function GalleryComponentMarketView({
  enabledTags,
  filters,
  searchQuery,
  onEnabledTagsChange,
}: {
  enabledTags: EnabledGalleryComponentTags
  filters: GalleryComponentMarketFilters
  searchQuery: string
  onEnabledTagsChange: (tags: EnabledGalleryComponentTags) => void
  onFiltersChange: (filters: GalleryComponentMarketFilters) => void
}) {
  const filteredComponents = React.useMemo(
    () =>
      filterGalleryComponentMarketComponents({
        enabledTags,
        filters,
        searchQuery,
      }),
    [enabledTags, filters.category, filters.status, searchQuery]
  )
  const componentTokenCounts = React.useMemo(
    () =>
      Object.fromEntries(
        galleryComponentMarketCatalog.map((component) => [
          component.tag,
          buildGalleryComponentPromptMetrics(enabledTags, component.tag)
            .componentTokens,
        ])
      ) as Record<GalleryComponentMarketItem["tag"], number>,
    [enabledTags]
  )

  function toggleEnabled(component: GalleryComponentMarketItem) {
    const nextTags = new Set(enabledTags)

    if (nextTags.has(component.tag)) {
      nextTags.delete(component.tag)
    } else {
      nextTags.add(component.tag)
    }

    onEnabledTagsChange(nextTags)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="flex min-w-0 flex-col">
        {filteredComponents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredComponents.map((component) => {
              const isInstalled =
                getGalleryComponentMarketStatus(component, enabledTags) ===
                "installed"
              return (
                <GalleryComponentMarketCard
                  component={component}
                  enabledTags={enabledTags}
                  isInstalled={isInstalled}
                  key={component.tag}
                  onToggleEnabled={toggleEnabled}
                  tokenCount={componentTokenCounts[component.tag]}
                />
              )
            })}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center rounded-lg border bg-card p-8 text-center text-card-foreground">
            <div className="max-w-sm">
              <PackageIcon
                aria-hidden="true"
                className="mx-auto size-8 text-muted-foreground"
              />
              <h3 className="mt-3 text-sm font-medium">No components found</h3>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Adjust the search, category, or status filters to show more
                registered components.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
