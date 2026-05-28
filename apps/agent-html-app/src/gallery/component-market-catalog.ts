import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import { deriveMarketComponents } from "@/agent-html/schema/derive"

export const galleryComponentMarketCatalog = deriveMarketComponents(
  agentHtmlComponentRegistry
)

export type GalleryComponentMarketItem =
  (typeof galleryComponentMarketCatalog)[number]

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

export const demoInstalledGalleryComponentTags = new Set([
  "Button",
  "Card",
  "Tabs",
  "Chart",
])

export function getGalleryComponentMarketStatus(
  component: GalleryComponentMarketItem
) {
  return demoInstalledGalleryComponentTags.has(component.tag)
    ? "installed"
    : "available"
}
