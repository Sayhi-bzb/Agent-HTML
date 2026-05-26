import type { AgentHtmlTag } from "@/agent-html/ast/types"

export const agentHtmlDocumentContainerTags = new Set<AgentHtmlTag>([
  "Page",
  "Section",
])

export const agentHtmlFlowLayoutTags = new Set<AgentHtmlTag>([
  "Stack",
  "Cluster",
  "Grid",
])

export const agentHtmlComponentAnatomyTags = new Set<AgentHtmlTag>([
  "AccordionContent",
  "AlertAction",
  "CardHeader",
  "CardContent",
  "CardFooter",
  "CarouselItem",
  "KanbanItem",
  "TabsContent",
  "TableCell",
  "TimelineContent",
])

export const agentHtmlNonBlockContentTags = new Set<AgentHtmlTag>([
  "Badge",
  "Icon",
  "Separator",
])

export const agentHtmlDataChildTags = new Set<AgentHtmlTag>([
  "ChartSeries",
  "ChartRow",
  "ChartTooltip",
  "TableCaption",
  "TableHeader",
  "TableBody",
  "TableFooter",
  "TableRow",
  "TableHead",
  "TableCell",
])
