import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
  AgentHtmlTag,
} from "@/gallery/preview/agent-html/ast"

export type AgentHtmlValidationCode =
  | "UNKNOWN_TAG"
  | "UNKNOWN_ATTR"
  | "INVALID_CHILD"
  | "MISSING_REQUIRED_ATTR"
  | "TEXT_NOT_ALLOWED"
  | "MISSING_REQUIRED_CHILD"

export type AgentHtmlValidationError = {
  code: AgentHtmlValidationCode
  message: string
  path: string
  tag?: string
  attr?: string
}

const layoutTags = new Set<AgentHtmlTag>(["Page", "Stack", "Cluster", "Grid"])

const allTags = new Set<AgentHtmlTag>([
  "Page",
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
  "Chart",
  "ChartSeries",
  "ChartTooltip",
  "Icon",
])

const allowedAttrs: Partial<Record<AgentHtmlTag, string[]>> = {
  Page: ["title", "gap"],
  Stack: ["gap"],
  Cluster: ["gap", "justify", "wrap"],
  Grid: ["columns", "gap"],
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
  Chart: ["type"],
  ChartSeries: ["key", "label"],
  ChartTooltip: ["hideLabel"],
  Icon: ["name"],
}

const requiredAttrs: Partial<Record<AgentHtmlTag, string[]>> = {
  Page: ["title"],
  Progress: ["value"],
  AspectRatio: ["ratio"],
  TabsTrigger: ["value"],
  TabsContent: ["value"],
  ChartSeries: ["key"],
  Icon: ["name"],
}

function isElement(node: AgentHtmlNode): node is AgentHtmlElementNode {
  return node.type === "element"
}

function elementChildren(node: AgentHtmlElementNode) {
  return node.children.filter(isElement)
}

function hasChild(node: AgentHtmlElementNode, tag: AgentHtmlTag) {
  return elementChildren(node).some((child) => child.tag === tag)
}

function validateNode(
  node: AgentHtmlNode,
  path: string,
  errors: AgentHtmlValidationError[]
) {
  if (node.type === "text") {
    return
  }

  const tag = node.tag
  if (!allTags.has(tag as AgentHtmlTag)) {
    errors.push({
      code: "UNKNOWN_TAG",
      message: `Unknown tag: ${tag}`,
      path,
      tag,
    })
    return
  }

  const knownTag = tag as AgentHtmlTag
  const allowed = new Set(allowedAttrs[knownTag] ?? [])
  for (const attr of Object.keys(node.attrs)) {
    if (!allowed.has(attr)) {
      errors.push({
        code: "UNKNOWN_ATTR",
        message: `Unknown attr "${attr}" on ${tag}`,
        path,
        tag,
        attr,
      })
    }
  }

  for (const attr of requiredAttrs[knownTag] ?? []) {
    if (!(attr in node.attrs)) {
      errors.push({
        code: "MISSING_REQUIRED_ATTR",
        message: `Missing required attr "${attr}" on ${tag}`,
        path,
        tag,
        attr,
      })
    }
  }

  if (layoutTags.has(knownTag)) {
    for (const child of node.children) {
      if (child.type === "text") {
        errors.push({
          code: "TEXT_NOT_ALLOWED",
          message: `Bare text is not allowed under ${tag}`,
          path,
          tag,
        })
      }
    }
  }

  if (knownTag === "Tabs") {
    if (!hasChild(node, "TabsList")) {
      errors.push({
        code: "MISSING_REQUIRED_CHILD",
        message: "Tabs must contain TabsList",
        path,
        tag,
      })
    }
  }

  if (knownTag === "AccordionItem") {
    if (!hasChild(node, "AccordionTrigger") || !hasChild(node, "AccordionContent")) {
      errors.push({
        code: "MISSING_REQUIRED_CHILD",
        message: "AccordionItem must contain AccordionTrigger and AccordionContent",
        path,
        tag,
      })
    }
  }

  if (knownTag === "TabsList") {
    for (const child of elementChildren(node)) {
      if (child.tag !== "TabsTrigger") {
        errors.push({
          code: "INVALID_CHILD",
          message: `TabsList can only contain TabsTrigger`,
          path: `${path}/${child.tag}`,
          tag: child.tag,
        })
      }
    }
  }

  if (knownTag === "TableHeader" || knownTag === "TableBody" || knownTag === "TableFooter") {
    for (const child of elementChildren(node)) {
      if (child.tag !== "TableRow") {
        errors.push({
          code: "INVALID_CHILD",
          message: `${tag} can only contain TableRow`,
          path: `${path}/${child.tag}`,
          tag: child.tag,
        })
      }
    }
  }

  if (knownTag === "TableRow") {
    const childTags = elementChildren(node).map((child) => child.tag)
    const onlyHeads = childTags.every((childTag) => childTag === "TableHead")
    const onlyCells = childTags.every((childTag) => childTag === "TableCell")
    if (!(onlyHeads || onlyCells)) {
      errors.push({
        code: "INVALID_CHILD",
        message: "TableRow must contain only TableHead or only TableCell",
        path,
        tag,
      })
    }
  }

  for (const child of node.children) {
    validateNode(
      child,
      child.type === "element" ? `${path}/${child.tag}` : `${path}/#text`,
      errors
    )
  }
}

export function validateAgentHtml(document: AgentHtmlDocument) {
  const errors: AgentHtmlValidationError[] = []

  if (document.root.tag !== "Page") {
    errors.push({
      code: "INVALID_CHILD",
      message: "Root element must be Page",
      path: "/",
      tag: document.root.tag,
    })
  }

  validateNode(document.root, "/Page", errors)

  return {
    ok: errors.length === 0,
    errors,
  }
}
