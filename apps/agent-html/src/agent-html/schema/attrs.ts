import type { AgentHtmlTag } from "@/agent-html/ast/types"

export const allowedAttrs: Partial<Record<AgentHtmlTag, string[]>> = {
  Page: ["title"],
  Section: ["width"],
  Stack: [],
  Cluster: ["justify", "wrap"],
  Grid: ["columns"],
  Accordion: ["type"],
  AccordionItem: ["value", "disabled"],
  Alert: ["variant"],
  AspectRatio: ["ratio"],
  Badge: ["variant"],
  Card: ["size"],
  Carousel: ["orientation"],
  Progress: ["value"],
  Separator: ["orientation"],
  Tabs: ["orientation", "defaultValue"],
  TabsTrigger: ["value", "disabled"],
  TabsContent: ["value"],
  TimelineItem: ["icon", "status", "meta"],
  Chart: ["type"],
  ChartSeries: ["key", "label"],
  ChartTooltip: ["hideLabel"],
  CodeBlock: ["language", "title"],
  Icon: ["name"],
  Image: ["src", "alt", "fit"],
  Text: ["variant"],
}

export const requiredAttrs: Partial<Record<AgentHtmlTag, string[]>> = {
  Page: ["title"],
  Progress: ["value"],
  AspectRatio: ["ratio"],
  TabsTrigger: ["value"],
  TabsContent: ["value"],
  Chart: ["type"],
  ChartSeries: ["key"],
  CodeBlock: ["language"],
  Icon: ["name"],
  Image: ["src", "alt"],
}

