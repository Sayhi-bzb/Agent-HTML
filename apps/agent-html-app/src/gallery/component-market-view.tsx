import * as React from "react"
import {
  ArrowDownToLineIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  Code2Icon,
  InfoIcon,
  PackageIcon,
  SearchIcon,
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/shared/ui/collapsible"
import { Input } from "@/app/shared/ui/input"
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
  onEnabledTagsChange,
  onFiltersChange,
}: {
  enabledTags: EnabledGalleryComponentTags
  filters: GalleryComponentMarketFilters
  onEnabledTagsChange: (tags: EnabledGalleryComponentTags) => void
  onFiltersChange: (filters: GalleryComponentMarketFilters) => void
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [technicalDetailsOpen, setTechnicalDetailsOpen] =
    React.useState(false)
  const [selectedTag, setSelectedTag] = React.useState(
    galleryComponentMarketCatalog.find((component) => component.tag === "Card")
      ?.tag ?? galleryComponentMarketCatalog[0]?.tag
  )

  const installedCount = React.useMemo(
    () =>
      galleryComponentMarketCatalog.filter((component) =>
        getGalleryComponentMarketStatus(component, enabledTags) === "installed"
      ).length,
    [enabledTags]
  )
  const availableCount = galleryComponentMarketCatalog.length - installedCount

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

  const selectedComponent = React.useMemo(
    () =>
      filteredComponents.find((component) => component.tag === selectedTag) ??
      filteredComponents[0] ??
      null,
    [filteredComponents, selectedTag]
  )

  const selectedPromptMetrics = React.useMemo(() => {
    if (!selectedComponent) {
      return null
    }

    return buildGalleryComponentPromptMetrics(enabledTags, selectedComponent.tag)
  }, [enabledTags, selectedComponent])

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
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-xs md:flex-row md:items-center">
          <div className="relative min-w-0 flex-1">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search components"
              className="pl-8"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search components"
              value={searchQuery}
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{installedCount} installed</Badge>
            <Badge variant="outline">{availableCount} available</Badge>
            <Badge variant="outline">{filteredComponents.length} shown</Badge>
          </div>
        </div>

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
              const isSelected = selectedComponent?.tag === component.tag

              return (
                <article
                  className={cn(
                    "flex min-h-44 min-w-0 flex-col rounded-lg border bg-card p-3 text-left text-card-foreground shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    isSelected
                      ? "border-primary/45 bg-primary/7"
                      : isInstalled
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

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{component.runtime}</Badge>
                    <Badge variant="outline">{component.role}</Badge>
                  </div>

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
                    <Button
                      aria-pressed={isSelected}
                      onClick={() => setSelectedTag(component.tag)}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                      aria-label={`View ${component.market.title} details`}
                    >
                      <InfoIcon aria-hidden="true" className="size-4" />
                    </Button>
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

      {selectedComponent ? (
        <aside className="min-w-0 rounded-lg border bg-card text-card-foreground shadow-xs xl:sticky xl:top-0 xl:self-start">
          <div className="border-b p-4">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground">
                <Code2Icon aria-hidden="true" className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate text-base font-semibold">
                    {selectedComponent.market.title}
                  </h2>
                  <Badge variant="outline">{selectedComponent.tag}</Badge>
                  <Badge variant="secondary">
                    {
                      galleryComponentMarketCategoryLabels[
                        selectedComponent.market.category
                      ]
                    }
                  </Badge>
                </div>
                <p className="mt-1 text-sm leading-5 text-muted-foreground">
                  {selectedComponent.market.summary}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {selectedPromptMetrics ? (
              <InlineBadgeRow
                label="Tokens"
                variant="default"
                values={[
                  `${selectedPromptMetrics.componentTokens.toLocaleString()} tokens`,
                ]}
              />
            ) : null}

            <InlineBadgeRow
              label="Props"
              values={[...(selectedComponent.market.configurableAttrs ?? ["children"])]}
            />

            <Collapsible
              open={technicalDetailsOpen}
              onOpenChange={setTechnicalDetailsOpen}
            >
              <CollapsibleTrigger asChild>
                <button
                  className="group flex w-full items-center justify-between rounded-md py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  type="button"
                  data-selection="none"
                  data-cursor="action"
                >
                  Technical details
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="size-4 transition-transform group-data-[state=open]:rotate-180"
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 pt-1">
                  <KeyValueRow label="Runtime" value={selectedComponent.runtime} />
                  <KeyValueRow label="Role" value={selectedComponent.role} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </aside>
      ) : null}
    </div>
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
