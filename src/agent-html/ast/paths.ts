import type { AgentHtmlElementNode, AgentHtmlNode } from "@/agent-html/ast/types"

export type AgentHtmlElementPathVisitor = (
  node: AgentHtmlElementNode,
  path: string,
  ancestors: AgentHtmlElementNode[]
) => void

function isElement(node: AgentHtmlNode): node is AgentHtmlElementNode {
  return node.type === "element"
}

export function agentHtmlElementChildren(node: AgentHtmlElementNode) {
  return node.children.filter(isElement)
}

export function agentHtmlChildPath(
  parentPath: string,
  tag: string,
  index: number
) {
  return `${parentPath}/${tag}[${index}]`
}

export function walkAgentHtmlElementPaths(
  node: AgentHtmlElementNode,
  visitor: AgentHtmlElementPathVisitor,
  ancestors: AgentHtmlElementNode[] = [],
  path = `/${node.tag}`
) {
  visitor(node, path, ancestors)

  const childCounts = new Map<string, number>()
  for (const child of agentHtmlElementChildren(node)) {
    const count = childCounts.get(child.tag) ?? 0
    childCounts.set(child.tag, count + 1)
    walkAgentHtmlElementPaths(
      child,
      visitor,
      [...ancestors, node],
      agentHtmlChildPath(path, child.tag, count)
    )
  }
}
