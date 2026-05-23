import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
  AgentHtmlTag,
} from "@/agent-html/ast/types"
import {
  allowedAttrs,
  requiredAttrs,
} from "@/agent-html/schema/attrs"
import { hasIconName } from "@/agent-html/icons/icon-registry"
import { allTags, layoutTags } from "@/agent-html/schema/tags"
import type { AgentHtmlValidationError } from "@/agent-html/validate/error-codes"

function isElement(node: AgentHtmlNode): node is AgentHtmlElementNode {
  return node.type === "element"
}

function elementChildren(node: AgentHtmlElementNode) {
  return node.children.filter(isElement)
}

function hasChild(node: AgentHtmlElementNode, tag: AgentHtmlTag) {
  return elementChildren(node).some((child) => child.tag === tag)
}

function isAllowedImageSrc(src: string) {
  return src.startsWith("https://") || (src.startsWith("/") && !src.startsWith("//"))
}

const codeBlockLanguages = new Set([
  "ahtml",
  "html",
  "tsx",
  "jsx",
  "ts",
  "js",
  "json",
  "bash",
])

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
    if (
      !hasChild(node, "AccordionTrigger") ||
      !hasChild(node, "AccordionContent")
    ) {
      errors.push({
        code: "MISSING_REQUIRED_CHILD",
        message:
          "AccordionItem must contain AccordionTrigger and AccordionContent",
        path,
        tag,
      })
    }
  }

  if (knownTag === "Icon") {
    if (node.children.length > 0) {
      errors.push({
        code: "INVALID_CHILD",
        message: "Icon cannot contain children",
        path,
        tag,
      })
    }

    const iconName = node.attrs.name
    if (iconName && !hasIconName(iconName)) {
      errors.push({
        code: "UNKNOWN_ICON_NAME",
        message: `Unknown icon name: ${iconName}`,
        path,
        tag,
        attr: "name",
      })
    }
  }

  if (knownTag === "Image") {
    if (node.children.length > 0) {
      errors.push({
        code: "INVALID_CHILD",
        message: "Image cannot contain children",
        path,
        tag,
      })
    }

    const src = node.attrs.src
    if (src !== undefined && !isAllowedImageSrc(src)) {
      errors.push({
        code: "INVALID_ATTR_VALUE",
        message: "Image src must start with https:// or /",
        path,
        tag,
        attr: "src",
      })
    }

    const fit = node.attrs.fit
    if (fit !== undefined && fit !== "cover" && fit !== "contain") {
      errors.push({
        code: "INVALID_ATTR_VALUE",
        message: "Image fit must be cover or contain",
        path,
        tag,
        attr: "fit",
      })
    }
  }

  if (knownTag === "Section") {
    const width = node.attrs.width
    if (
      width !== undefined &&
      width !== "full" &&
      width !== "content" &&
      width !== "reader"
    ) {
      errors.push({
        code: "INVALID_ATTR_VALUE",
        message: "Section width must be full, content, or reader",
        path,
        tag,
        attr: "width",
      })
    }
  }

  if (knownTag === "Text") {
    for (const child of node.children) {
      if (child.type === "element") {
        errors.push({
          code: "INVALID_CHILD",
          message: "Text can only contain text",
          path: `${path}/${child.tag}`,
          tag: child.tag,
        })
      }
    }
  }

  if (knownTag === "Carousel") {
    if (!hasChild(node, "CarouselContent")) {
      errors.push({
        code: "MISSING_REQUIRED_CHILD",
        message: "Carousel must contain CarouselContent",
        path,
        tag,
      })
    }

    for (const child of elementChildren(node)) {
      if (
        child.tag !== "CarouselContent" &&
        child.tag !== "CarouselPrevious" &&
        child.tag !== "CarouselNext"
      ) {
        errors.push({
          code: "INVALID_CHILD",
          message:
            "Carousel can only contain CarouselContent, CarouselPrevious, and CarouselNext",
          path: `${path}/${child.tag}`,
          tag: child.tag,
        })
      }
    }
  }

  if (knownTag === "CarouselContent") {
    const children = elementChildren(node)

    if (children.length === 0) {
      errors.push({
        code: "MISSING_REQUIRED_CHILD",
        message: "CarouselContent must contain CarouselItem",
        path,
        tag,
      })
    }

    for (const child of children) {
      if (child.tag !== "CarouselItem") {
        errors.push({
          code: "INVALID_CHILD",
          message: "CarouselContent can only contain CarouselItem",
          path: `${path}/${child.tag}`,
          tag: child.tag,
        })
      }
    }
  }

  if (knownTag === "Chart") {
    const children = elementChildren(node)
    const seriesChildren = children.filter((child) => child.tag === "ChartSeries")
    const tooltipChildren = children.filter((child) => child.tag === "ChartTooltip")

    if (seriesChildren.length === 0) {
      errors.push({
        code: "MISSING_REQUIRED_CHILD",
        message: "Chart must contain at least one ChartSeries",
        path,
        tag,
      })
    }

    if (tooltipChildren.length > 1) {
      errors.push({
        code: "INVALID_CHILD",
        message: "Chart can contain at most one ChartTooltip",
        path,
        tag,
      })
    }

    for (const child of children) {
      if (child.tag !== "ChartSeries" && child.tag !== "ChartTooltip") {
        errors.push({
          code: "INVALID_CHILD",
          message: "Chart can only contain ChartSeries and ChartTooltip",
          path: `${path}/${child.tag}`,
          tag: child.tag,
        })
      }
    }
  }

  if (knownTag === "CodeBlock") {
    const language = node.attrs.language
    if (language !== undefined && !codeBlockLanguages.has(language)) {
      errors.push({
        code: "INVALID_ATTR_VALUE",
        message: "CodeBlock language is not supported",
        path,
        tag,
        attr: "language",
      })
    }

    const textChildren = node.children.filter((child) => child.type === "text")
    const elementChild = elementChildren(node)[0]
    if (elementChild) {
      errors.push({
        code: "INVALID_CHILD",
        message: "CodeBlock can only contain raw code text",
        path: `${path}/${elementChild.tag}`,
        tag: elementChild.tag,
      })
    }

    if (
      textChildren.length === 0 ||
      textChildren.every((child) => child.type === "text" && child.value.trim().length === 0)
    ) {
      errors.push({
        code: "MISSING_REQUIRED_CHILD",
        message: "CodeBlock must contain raw code text",
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
          message: "TabsList can only contain TabsTrigger",
          path: `${path}/${child.tag}`,
          tag: child.tag,
        })
      }
    }
  }

  if (
    knownTag === "TableHeader" ||
    knownTag === "TableBody" ||
    knownTag === "TableFooter"
  ) {
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


