import { describe, expect, it } from "vitest"

import type { AgentHtmlTag } from "@/agent-html/ast/types"
import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import { defaultAttrs } from "@/agent-html/schema/defaults"
import {
  buildAgentHtmlPromptDocument,
  buildAgentHtmlPromptGrammar,
} from "@/agent-html/schema/prompt-grammar"
import { allowedAttrs, requiredAttrs } from "@/agent-html/schema/attrs"
import { allTags, layoutTags } from "@/agent-html/schema/tags"
import {
  createEnabledComponentRegistry,
  deriveMarketComponents,
  deriveRuntimeBoundary,
} from "@/agent-html/schema/derive"

const expectedTags: AgentHtmlTag[] = [
  "Page",
  "Section",
  "Stack",
  "Cluster",
  "Grid",
  "Accordion",
  "AccordionItem",
  "AccordionTrigger",
  "AccordionContent",
  "Alert",
  "AlertTitle",
  "AlertDescription",
  "AlertAction",
  "AspectRatio",
  "Badge",
  "Button",
  "Card",
  "CardHeader",
  "CardTitle",
  "CardDescription",
  "CardAction",
  "CardContent",
  "CardFooter",
  "Carousel",
  "CarouselContent",
  "CarouselItem",
  "CarouselPrevious",
  "CarouselNext",
  "Progress",
  "Separator",
  "Table",
  "TableCaption",
  "TableHeader",
  "TableBody",
  "TableFooter",
  "TableRow",
  "TableHead",
  "TableCell",
  "Tabs",
  "TabsList",
  "TabsTrigger",
  "TabsContent",
  "Timeline",
  "TimelineItem",
  "TimelineTitle",
  "TimelineDescription",
  "TimelineContent",
  "Chart",
  "ChartSeries",
  "ChartRow",
  "ChartTooltip",
  "CodeBlock",
  "Icon",
  "Image",
  "Kanban",
  "KanbanColumn",
  "KanbanItem",
  "Text",
]

describe("agentHtmlComponentRegistry", () => {
  it("derives the current tag sets", () => {
    expect([...allTags]).toEqual(expectedTags)
    expect([...layoutTags]).toEqual(["Page", "Section", "Stack", "Cluster", "Grid"])
  })

  it("derives allowed and required attrs", () => {
    expect(allowedAttrs.Button).toEqual(["variant", "href", "label"])
    expect(allowedAttrs.ChartRow).toEqual(["label"])
    expect(allowedAttrs.KanbanColumn).toEqual(["value", "title"])
    expect(requiredAttrs.Page).toEqual(["title"])
    expect(requiredAttrs.Image).toEqual(["src", "alt"])
    expect(requiredAttrs.KanbanItem).toEqual(["value"])
  })

  it("derives default attrs used by runtimes", () => {
    expect(defaultAttrs.Cluster).toEqual({ justify: "start", wrap: "true" })
    expect(defaultAttrs.Grid).toEqual({ columns: "2" })
    expect(defaultAttrs.Section).toEqual({ width: "content" })
    expect(defaultAttrs.TimelineItem).toEqual({ status: "default" })
  })

  it("keeps each registered tag unique", () => {
    const tags = agentHtmlComponentRegistry.map((contract) => contract.tag)

    expect(new Set(tags).size).toBe(tags.length)
  })

  it("derives a market catalog for independently insertable components", () => {
    const catalog = deriveMarketComponents(agentHtmlComponentRegistry)
    const catalogTags = catalog.map((component) => component.tag)

    expect(catalogTags).toEqual([
      "Accordion",
      "Alert",
      "AspectRatio",
      "Badge",
      "Button",
      "Card",
      "Carousel",
      "Progress",
      "Separator",
      "Table",
      "Tabs",
      "Timeline",
      "Chart",
      "CodeBlock",
      "Image",
      "Kanban",
    ])
    expect(catalogTags).not.toContain("ChartRow")
    expect(catalogTags).not.toContain("CardHeader")
    expect(catalogTags).not.toContain("Icon")
    expect(catalogTags).not.toContain("Text")
    expect(
      catalog.every(
        (component) =>
          component.role === "component" &&
          component.market.title &&
          component.market.summary &&
          component.market.category &&
          component.market.insertTemplate &&
          component.market.previewExample
      )
    ).toBe(true)
  })

  it("derives runtime boundaries for layout, special, data, and mapped components", () => {
    const boundary = deriveRuntimeBoundary(agentHtmlComponentRegistry)
    const byTag = new Map(boundary.map((component) => [component.tag, component]))

    expect(byTag.get("Page")).toMatchObject({
      role: "layout",
      runtime: "layout-special",
    })
    expect(byTag.get("Button")).toMatchObject({
      role: "component",
      runtime: "component-map",
    })
    expect(byTag.get("Chart")).toMatchObject({
      role: "component",
      runtime: "special-renderer",
    })
    expect(byTag.get("ChartRow")).toMatchObject({
      role: "data",
      runtime: "data-only",
    })
    expect(byTag.get("Icon")).toMatchObject({
      role: "utility",
      runtime: "special-renderer",
    })
  })

  it("creates enabled registries with structural dependencies", () => {
    const enabledRegistry = createEnabledComponentRegistry(
      agentHtmlComponentRegistry,
      new Set<AgentHtmlTag>(["Card", "Chart"])
    )
    const enabledTags = enabledRegistry.map((contract) => contract.tag)

    expect(enabledTags).toContain("Page")
    expect(enabledTags).toContain("Grid")
    expect(enabledTags).toContain("Icon")
    expect(enabledTags).toContain("Text")
    expect(enabledTags).toContain("Card")
    expect(enabledTags).toContain("CardHeader")
    expect(enabledTags).toContain("CardTitle")
    expect(enabledTags).toContain("CardContent")
    expect(enabledTags).toContain("Chart")
    expect(enabledTags).toContain("ChartSeries")
    expect(enabledTags).toContain("ChartRow")
    expect(enabledTags).toContain("ChartTooltip")
    expect(enabledTags).not.toContain("Tabs")
    expect(enabledTags).not.toContain("Button")
  })

  it("builds prompt grammar from registered contracts", () => {
    const grammar = buildAgentHtmlPromptGrammar()

    expect(grammar.layout).toContain("- `Grid:columns?=\"1|2|3|4\" -> Layout | UI`")
    expect(grammar.ui).toContain("- `Button:variant?=\"default|outline|ghost|destructive|secondary|link\", href?=string, label?=string -> Text, Icon?`")
    expect(grammar.ui).toContain("- `Tabs:orientation?=\"horizontal|vertical\", defaultValue?=string -> TabsList, TabsContent+`")
    expect(grammar.ui).toContain(
      "- `ChartRow:label=string, [series key]=number -> none`"
    )
    expect(grammar.ui).toContain("- `KanbanColumn:value=string, title=string -> KanbanItem+`")
  })

  it("builds prompt grammar from an enabled registry", () => {
    const enabledRegistry = createEnabledComponentRegistry(
      agentHtmlComponentRegistry,
      new Set<AgentHtmlTag>(["Card", "Chart"])
    )
    const grammar = buildAgentHtmlPromptGrammar({ registry: enabledRegistry })

    expect(grammar.ui).toContain("- `Card:size?=\"default|sm\" -> CardHeader?, CardContent?, CardFooter?`")
    expect(grammar.ui).toContain("- `Chart:type=\"area|bar\" -> ChartSeries+, ChartRow+, ChartTooltip?`")
    expect(grammar.ui).toContain("- `ChartRow:label=string, [series key]=number -> none`")
    expect(grammar.ui).not.toContain("- `Tabs:")
    expect(grammar.ui).not.toContain("- `Button:")
  })

  it("builds prompt documents with generated layout and ui grammar", () => {
    const document = buildAgentHtmlPromptDocument(`# Gallery Preview DSL

## Contract

- Keep this hand-authored.

## Layout

- old layout

## UI

- old ui

## Never

- Keep this hand-authored too.
`)

    expect(document).toContain("- Keep this hand-authored.")
    expect(document).toContain("- Keep this hand-authored too.")
    expect(document).not.toContain("- old layout")
    expect(document).not.toContain("- old ui")
    expect(document).toContain("- `Accordion:type?=\"single|multiple\" -> AccordionItem+`")
    expect(document).toContain("- `ChartSeries:key=string, label?=string -> none`")
    expect(document).toContain(
      "- `ChartRow:label=string, [series key]=number -> none`"
    )
    expect(document).toContain("- `Kanban -> KanbanColumn+`")
  })
})
