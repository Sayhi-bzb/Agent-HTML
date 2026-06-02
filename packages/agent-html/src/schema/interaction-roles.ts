import type { AgentHtmlTag } from "@/agent-html/ast/types"

export const agentHtmlDocumentContainerTags = new Set<AgentHtmlTag>([
  "Cell",
  "Section",
])

export const agentHtmlExplicitBlockTags = new Set<AgentHtmlTag>([
  "Block",
])

export const agentHtmlFlowLayoutTags = new Set<AgentHtmlTag>([
  "Stack",
  "Cluster",
  "Grid",
])
