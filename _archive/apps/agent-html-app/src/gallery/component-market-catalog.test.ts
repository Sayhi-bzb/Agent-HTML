import { describe, expect, it } from "vitest"

import type { AgentHtmlTag } from "@/agent-html"
import {
  defaultEnabledGalleryComponentTags,
  filterGalleryComponentMarketComponents,
  galleryComponentMarketAllCategory,
  galleryComponentMarketCatalog,
  galleryComponentMarketCategoryLabels,
  getGalleryComponentMarketCategoryCounts,
  getGalleryComponentMarketInstalledCount,
  matchesGalleryComponentMarketSearch,
} from "@/app/gallery/component-market-catalog"

describe("component market catalog", () => {
  it("matches components by title, tag, summary, category, or empty query", () => {
    const card = galleryComponentMarketCatalog.find(
      (component) => component.tag === "Card"
    )

    expect(card).toBeDefined()
    expect(matchesGalleryComponentMarketSearch(card!, "")).toBe(true)
    expect(matchesGalleryComponentMarketSearch(card!, "card")).toBe(true)
    expect(matchesGalleryComponentMarketSearch(card!, "layout")).toBe(true)
    expect(matchesGalleryComponentMarketSearch(card!, "missing")).toBe(false)
  })

  it("counts installed components through the registered catalog", () => {
    expect(
      getGalleryComponentMarketInstalledCount(defaultEnabledGalleryComponentTags)
    ).toBe(4)
  })

  it("counts every registered category", () => {
    const counts = getGalleryComponentMarketCategoryCounts()

    for (const category of Object.keys(galleryComponentMarketCategoryLabels)) {
      expect(counts[category as keyof typeof counts]).toBeGreaterThanOrEqual(0)
    }

    expect(Object.values(counts).reduce((total, count) => total + count, 0)).toBe(
      galleryComponentMarketCatalog.length
    )
  })

  it("filters components by search, category, and installed status", () => {
    const enabledTags = new Set<AgentHtmlTag>(["Card"])

    expect(
      filterGalleryComponentMarketComponents({
        enabledTags,
        filters: { category: galleryComponentMarketAllCategory, status: "all" },
        searchQuery: "card",
      }).map((component) => component.tag)
    ).toContain("Card")

    expect(
      filterGalleryComponentMarketComponents({
        enabledTags,
        filters: { category: "layout", status: "installed" },
        searchQuery: "",
      }).map((component) => component.tag)
    ).toEqual(["Card"])

    expect(
      filterGalleryComponentMarketComponents({
        enabledTags,
        filters: { category: "layout", status: "available" },
        searchQuery: "card",
      })
    ).toEqual([])
  })
})
