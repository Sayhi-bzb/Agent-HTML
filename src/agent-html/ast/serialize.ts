import type {
  AgentHtmlAttrMap,
  AgentHtmlElementNode,
  AgentHtmlNode,
} from "@/agent-html/ast/types"

function serializeAttrs(attrs: AgentHtmlAttrMap) {
  return Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("")
}

function indent(level: number) {
  return "  ".repeat(level)
}

function isTextOnlyElement(node: AgentHtmlElementNode) {
  return (
    node.children.length === 1 &&
    node.children[0]?.type === "text" &&
    node.tag !== "CodeBlock"
  )
}

export function serializeAgentHtmlNode(
  node: AgentHtmlNode,
  depth = 0
): string {
  if (node.type === "text") {
    return node.value
  }

  const attrs = serializeAttrs(node.attrs)

  if (node.children.length === 0) {
    return `${indent(depth)}<${node.tag}${attrs} />`
  }

  if (isTextOnlyElement(node)) {
    return `${indent(depth)}<${node.tag}${attrs}>${serializeAgentHtmlNode(
      node.children[0]
    )}</${node.tag}>`
  }

  if (node.tag === "CodeBlock") {
    return [
      `${indent(depth)}<${node.tag}${attrs}>`,
      ...node.children.map((child) => serializeAgentHtmlNode(child)),
      `${indent(depth)}</${node.tag}>`,
    ].join("\n")
  }

  return [
    `${indent(depth)}<${node.tag}${attrs}>`,
    ...node.children.map((child) => serializeAgentHtmlNode(child, depth + 1)),
    `${indent(depth)}</${node.tag}>`,
  ].join("\n")
}
