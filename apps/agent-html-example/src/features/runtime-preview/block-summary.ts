import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
  AgentHtmlTag,
} from "@/agent-html/ast/types"
import { walkAgentHtmlElementPaths } from "@/agent-html/ast/paths"

const hiddenSummaryTags = new Set<AgentHtmlTag>([
  "Page",
  "Section",
  "Stack",
  "Cluster",
  "Grid",
])
const maxSummaryLines = 10

function isElement(node: AgentHtmlNode): node is AgentHtmlElementNode {
  return node.type === "element"
}

function hasTextContent(node: AgentHtmlElementNode) {
  return node.children.some(
    (child) => child.type === "text" && child.value.trim().length > 0
  )
}

function childElements(node: AgentHtmlElementNode): AgentHtmlElementNode[] {
  return node.children.filter(isElement)
}

function visibleChildren(node: AgentHtmlElementNode): AgentHtmlElementNode[] {
  return childElements(node).flatMap((child) =>
    hiddenSummaryTags.has(child.tag as AgentHtmlTag)
      ? visibleChildren(child)
      : [child]
  )
}

function summarizeElement(node: AgentHtmlElementNode, level: number): string[] {
  const indent = "  ".repeat(level)
  const children = visibleChildren(node)

  if (children.length === 0) {
    return hasTextContent(node)
      ? [`${indent}<${node.tag}>...</${node.tag}>`]
      : [`${indent}<${node.tag}/>`]
  }

  return [
    `${indent}<${node.tag}>`,
    ...children.flatMap((child) => summarizeElement(child, level + 1)),
    `${indent}</${node.tag}>`,
  ]
}

export function summarizeAgentHtmlBlock(node: AgentHtmlElementNode) {
  const children = hiddenSummaryTags.has(node.tag as AgentHtmlTag)
    ? visibleChildren(node)
    : [node]
  const lines = children.flatMap((child) => summarizeElement(child, 0))

  if (lines.length <= maxSummaryLines) {
    return lines.join("\n")
  }

  return [...lines.slice(0, maxSummaryLines - 1), "..."].join("\n")
}

export function createAgentHtmlBlockSummaryMap(document: AgentHtmlDocument) {
  const summaries: Record<string, string> = {}

  walkAgentHtmlElementPaths(document.root, (node, path) => {
    const summary = summarizeAgentHtmlBlock(node)

    if (summary) {
      summaries[path] = summary
    }
  })

  return summaries
}
