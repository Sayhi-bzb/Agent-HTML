export type AgentHtmlLayoutTag =
  | "Page"
  | "Section"
  | "Stack"
  | "Cluster"
  | "Grid"

export type AgentHtmlUiTag =
  | "Accordion"
  | "AccordionItem"
  | "AccordionTrigger"
  | "AccordionContent"
  | "Alert"
  | "AlertTitle"
  | "AlertDescription"
  | "AlertAction"
  | "AspectRatio"
  | "Badge"
  | "Card"
  | "CardHeader"
  | "CardTitle"
  | "CardDescription"
  | "CardAction"
  | "CardContent"
  | "CardFooter"
  | "Carousel"
  | "CarouselContent"
  | "CarouselItem"
  | "CarouselPrevious"
  | "CarouselNext"
  | "Progress"
  | "Separator"
  | "Table"
  | "TableCaption"
  | "TableHeader"
  | "TableBody"
  | "TableFooter"
  | "TableRow"
  | "TableHead"
  | "TableCell"
  | "Tabs"
  | "TabsList"
  | "TabsTrigger"
  | "TabsContent"
  | "Chart"
  | "ChartSeries"
  | "ChartTooltip"
  | "Icon"
  | "Image"
  | "Text"

export type AgentHtmlTag = AgentHtmlLayoutTag | AgentHtmlUiTag

export type AgentHtmlAttrValue = string

export type AgentHtmlAttrMap = Record<string, AgentHtmlAttrValue>

export type AgentHtmlTextNode = {
  type: "text"
  value: string
}

export type AgentHtmlElementNode = {
  type: "element"
  tag: AgentHtmlTag | string
  attrs: AgentHtmlAttrMap
  children: AgentHtmlNode[]
}

export type AgentHtmlNode = AgentHtmlTextNode | AgentHtmlElementNode

export type AgentHtmlDocument = {
  root: AgentHtmlElementNode
}
