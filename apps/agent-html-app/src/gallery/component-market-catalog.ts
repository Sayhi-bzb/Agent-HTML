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

export type GalleryComponentMarketStatus = "all" | "available" | "installed"

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

export const galleryComponentMarketTags = new Set<AgentHtmlTag>(
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
