import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
  AgentHtmlTag,
} from "@/gallery/preview/agent-html/ast/types"
import {
  allowedAttrs,
  requiredAttrs,
} from "@/gallery/preview/agent-html/shared/attrs"
import { allTags, layoutTags } from "@/gallery/preview/agent-html/shared/tags"
import type { AgentHtmlValidationError } from "@/gallery/preview/agent-html/validate/error-codes"

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
