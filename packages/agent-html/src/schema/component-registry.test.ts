import { describe, expect, it } from "vitest"

import type { AgentHtmlTag } from "@/agent-html/ast/types"
import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import { defaultAttrs } from "@/agent-html/schema/defaults"
import { buildAgentHtmlPromptGrammar } from "@/agent-html/schema/prompt-grammar"
import { allowedAttrs, requiredAttrs } from "@/agent-html/schema/attrs"
import { allTags, layoutTags } from "@/agent-html/schema/tags"

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
})
