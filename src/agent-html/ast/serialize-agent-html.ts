import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
} from "@/agent-html/ast/types"

const rawTextTags = new Set(["CodeBlock"])
const selfClosingTags = new Set([
  "CarouselNext",
  "CarouselPrevious",
  "ChartRow",
  "ChartSeries",
  "ChartTooltip",
  "Icon",
  "Image",
  "Progress",
  "Separator",
])

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")
}

function serializeAttrs(attrs: AgentHtmlElementNode["attrs"]) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeAttr(value)}"`)
    .join(" ")
}

function serializeOpeningTag(node: AgentHtmlElementNode) {
  const attrs = serializeAttrs(node.attrs)
  return attrs ? `<${node.tag} ${attrs}>` : `<${node.tag}>`
}

function serializeSelfClosingTag(node: AgentHtmlElementNode) {
  const attrs = serializeAttrs(node.attrs)
  return attrs ? `<${node.tag} ${attrs} />` : `<${node.tag} />`
}

function indent(level: number) {
  return "  ".repeat(level)
}

function serializeNode(node: AgentHtmlNode, level: number): string {
  if (node.type === "text") {
    return `${indent(level)}${node.value}`
  }

  if (selfClosingTags.has(node.tag) && node.children.length === 0) {
    return `${indent(level)}${serializeSelfClosingTag(node)}`
  }

  if (
    node.children.length === 1 &&
    node.children[0]?.type === "text" &&
    !rawTextTags.has(node.tag)
  ) {
    return `${indent(level)}${serializeOpeningTag(node)}${node.children[0].value}</${node.tag}>`
  }

  if (
    node.children.length === 1 &&
    node.children[0]?.type === "text" &&
    rawTextTags.has(node.tag)
  ) {
    return [
      `${indent(level)}${serializeOpeningTag(node)}`,
      node.children[0].value,
      `${indent(level)}</${node.tag}>`,
    ].join("\n")
  }

  const children = node.children
    .map((child) => serializeNode(child, level + 1))
    .join("\n")

  return [
    `${indent(level)}${serializeOpeningTag(node)}`,
    children,
    `${indent(level)}</${node.tag}>`,
  ].join("\n")
}

export function serializeAgentHtml(document: AgentHtmlDocument) {
  return `${serializeNode(document.root, 0)}\n`
}
