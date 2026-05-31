import {
  agentHtmlComponentRegistry,
  deriveMarketComponents,
  type AgentHtmlTag,
} from "@/agent-html"

export const galleryComponentMarketCatalog = deriveMarketComponents(
  agentHtmlComponentRegistry
)

export type GalleryComponentMarketItem =
  (typeof galleryComponentMarketCatalog)[number]

export type EnabledGalleryComponentTags = ReadonlySet<AgentHtmlTag>

export type GalleryComponentMarketCategory =
  GalleryComponentMarketItem["market"]["category"]

type GalleryComponentMarketStatus = "all" | "available" | "installed"

export type GalleryComponentMarketFilters = {
  category: GalleryComponentMarketCategory | "all"
  status: GalleryComponentMarketStatus
}

export const galleryComponentMarketAllCategory = "all" as const

export const galleryComponentMarketCategoryLabels: Record<
  GalleryComponentMarketCategory,
  string
> = {
  content: "Content",
  data: "Data",
  display: "Display",
  feedback: "Feedback",
  form: "Form",
  layout: "Layout",
  media: "Media",
  navigation: "Navigation",
}

export const defaultEnabledGalleryComponentTags = new Set<AgentHtmlTag>([
  "Button",
  "Card",
  "Tabs",
  "Chart",
])

const galleryComponentMarketTags = new Set<AgentHtmlTag>(
  galleryComponentMarketCatalog.map((component) => component.tag)
)

export function normalizeEnabledGalleryComponentTags(
  tags: Iterable<string>
): Set<AgentHtmlTag> {
  const enabledTags = new Set<AgentHtmlTag>()

  for (const tag of tags) {
    if (galleryComponentMarketTags.has(tag as AgentHtmlTag)) {
      enabledTags.add(tag as AgentHtmlTag)
    }
  }

  return enabledTags
}

export function getGalleryComponentMarketStatus(
  component: GalleryComponentMarketItem,
  enabledTags: ReadonlySet<AgentHtmlTag>
) {
  return enabledTags.has(component.tag)
    ? "installed"
    : "available"
}

export function getGalleryComponentMarketInstalledCount(
  enabledTags: ReadonlySet<AgentHtmlTag>
) {
  return galleryComponentMarketCatalog.filter((component) =>
    enabledTags.has(component.tag)
  ).length
}

export function getGalleryComponentMarketCategoryCounts() {
  const counts = Object.fromEntries(
    Object.keys(galleryComponentMarketCategoryLabels).map((category) => [
      category,
      0,
    ])
  ) as Record<GalleryComponentMarketCategory, number>

  for (const component of galleryComponentMarketCatalog) {
    counts[component.market.category] += 1
  }

  return counts
}

export function matchesGalleryComponentMarketSearch(
  component: GalleryComponentMarketItem,
  query: string
) {
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

export function filterGalleryComponentMarketComponents({
  enabledTags,
  filters,
  searchQuery,
}: {
  enabledTags: ReadonlySet<AgentHtmlTag>
  filters: GalleryComponentMarketFilters
  searchQuery: string
}) {
  return galleryComponentMarketCatalog.filter((component) => {
    const status = getGalleryComponentMarketStatus(component, enabledTags)

    return (
      matchesGalleryComponentMarketSearch(component, searchQuery) &&
      (filters.category === galleryComponentMarketAllCategory ||
        component.market.category === filters.category) &&
      (filters.status === "all" || status === filters.status)
    )
  })
}
