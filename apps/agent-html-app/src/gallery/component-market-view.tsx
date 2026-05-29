import * as React from "react"
import {
  ArrowDownToLineIcon,
  CheckCircle2Icon,
  Code2Icon,
  InfoIcon,
  PackageIcon,
} from "lucide-react"

import {
  galleryComponentMarketAllCategory,
  galleryComponentMarketCatalog,
  galleryComponentMarketCategoryLabels,
  getGalleryComponentMarketStatus,
  type EnabledGalleryComponentTags,
  type GalleryComponentMarketCategory,
  type GalleryComponentMarketFilters,
  type GalleryComponentMarketItem,
  type GalleryComponentMarketStatus,
} from "@/app/gallery/component-market-catalog"
import { buildGalleryComponentPromptMetrics } from "@/app/gallery/component-market-repository"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/shared/ui/popover"
import { cn } from "@/app/shared/lib/utils"

function matchesSearch(component: GalleryComponentMarketItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return [
    component.tag,
    component.market.title,
    component.market.summary,
    component.market.category,
  ].some((value) => value.toLowerCase().includes(normalizedQuery))
}

export function GalleryComponentMarketView({
  enabledTags,
  filters,
  searchQuery,
  onEnabledTagsChange,
  onFiltersChange,
}: {
  enabledTags: EnabledGalleryComponentTags
  filters: GalleryComponentMarketFilters
  searchQuery: string
  onEnabledTagsChange: (tags: EnabledGalleryComponentTags) => void
  onFiltersChange: (filters: GalleryComponentMarketFilters) => void
}) {
  const categoryFilters = React.useMemo(() => {
    const categoryCounts = galleryComponentMarketCatalog.reduce(
      (counts, component) => {
        const category = component.market.category
        counts[category] = (counts[category] ?? 0) + 1
        return counts
      },
      {} as Partial<Record<GalleryComponentMarketCategory, number>>
    )

    return (
      Object.keys(
        galleryComponentMarketCategoryLabels
      ) as GalleryComponentMarketCategory[]
    )
      .filter((category) => categoryCounts[category])
      .map((category) => ({
        count: categoryCounts[category] ?? 0,
        id: category,
        label: galleryComponentMarketCategoryLabels[category],
      }))
  }, [])

  const filteredComponents = React.useMemo(
    () =>
      galleryComponentMarketCatalog.filter((component) => {
        const status = getGalleryComponentMarketStatus(component, enabledTags)

        return (
          matchesSearch(component, searchQuery) &&
          (filters.category === galleryComponentMarketAllCategory ||
            component.market.category === filters.category) &&
          (filters.status === "all" || status === filters.status)
        )
      }),
    [enabledTags, filters.category, filters.status, searchQuery]
  )

  function updateStatus(status: GalleryComponentMarketStatus) {
    onFiltersChange({ ...filters, status })
  }

  function updateCategory(
    category:
      | GalleryComponentMarketCategory
      | typeof galleryComponentMarketAllCategory
  ) {
    onFiltersChange({ ...filters, category })
  }

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
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => updateStatus("all")}
            size="sm"
            variant={filters.status === "all" ? "secondary" : "outline"}
          >
            All
          </Button>
          <Button
            onClick={() => updateStatus("installed")}
            size="sm"
            variant={filters.status === "installed" ? "secondary" : "outline"}
          >
            Installed
          </Button>
          <Button
            onClick={() => updateStatus("available")}
            size="sm"
            variant={filters.status === "available" ? "secondary" : "outline"}
          >
            Available
          </Button>
          <span className="mx-1 h-7 w-px bg-border" aria-hidden="true" />
          <Button
            onClick={() => updateCategory(galleryComponentMarketAllCategory)}
            size="sm"
            variant={
              filters.category === galleryComponentMarketAllCategory
                ? "secondary"
                : "outline"
            }
          >
            All categories
          </Button>
          {categoryFilters.map((category) => (
            <Button
              key={category.id}
              onClick={() => updateCategory(category.id)}
              size="sm"
              variant={filters.category === category.id ? "secondary" : "outline"}
            >
              {category.label}
            </Button>
          ))}
        </div>

        {filteredComponents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {filteredComponents.map((component) => {
              const isInstalled =
                getGalleryComponentMarketStatus(component, enabledTags) ===
                "installed"

              return (
                <article
                  className={cn(
                    "flex min-h-44 min-w-0 flex-col rounded-lg border bg-card p-3 text-left text-card-foreground shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    isInstalled
                        ? "border-primary/25 bg-primary/5"
                        : "hover:border-foreground/20"
                  )}
                  key={component.tag}
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground">
                      <PackageIcon aria-hidden="true" className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="min-w-0 truncate text-sm font-medium">
                          {component.market.title}
                        </h3>
                        {isInstalled ? (
                          <CheckCircle2Icon
                            aria-label="Installed"
                            className="size-4 shrink-0 text-primary"
                          />
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {
                          galleryComponentMarketCategoryLabels[
                            component.market.category
                          ]
                        }
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {component.market.summary}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <Button
                      onClick={() => toggleEnabled(component)}
                      size="sm"
                      variant={isInstalled ? "outline" : "default"}
                    >
                      {isInstalled ? (
                        <CheckCircle2Icon aria-hidden="true" className="size-4" />
                      ) : (
                        <ArrowDownToLineIcon
                          aria-hidden="true"
                          className="size-4"
                        />
                      )}
                      {isInstalled ? "Remove" : "Install"}
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                          aria-label={`View ${component.market.title} details`}
                        >
                          <InfoIcon aria-hidden="true" className="size-4" />
                        </Button>
                      </PopoverTrigger>
                      <GalleryComponentDetailPopoverContent
                        component={component}
                        enabledTags={enabledTags}
                      />
                    </Popover>
                  </div>
                </article>
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

function GalleryComponentDetailPopoverContent({
  component,
  enabledTags,
}: {
  component: GalleryComponentMarketItem
  enabledTags: EnabledGalleryComponentTags
}) {
  const promptMetrics = React.useMemo(
    () => buildGalleryComponentPromptMetrics(enabledTags, component.tag),
    [component.tag, enabledTags]
  )

  return (
    <PopoverContent align="end" className="w-80" side="top">
      <div className="flex items-start gap-3">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground">
          <Code2Icon aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-medium">
            {component.market.title} details
          </h2>
          <div className="mt-2 flex min-w-0 flex-wrap gap-1.5">
            <Badge variant="outline">{component.tag}</Badge>
            <Badge variant="default">
              {promptMetrics.componentTokens.toLocaleString()} tokens
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <InlineBadgeRow
          label="Props"
          values={[...(component.market.configurableAttrs ?? ["children"])]}
        />
        <KeyValueRow label="Runtime" value={component.runtime} />
        <KeyValueRow label="Role" value={component.role} />
      </div>
    </PopoverContent>
  )
}

function InlineBadgeRow({
  label,
  values,
  variant = "secondary",
}: {
  label: string
  values: readonly string[]
  variant?: React.ComponentProps<typeof Badge>["variant"]
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-xs font-medium uppercase text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {values.map((value) => (
          <Badge key={value} variant={variant}>
            {value}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  )
}
