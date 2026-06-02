import type { AgentHtmlTag } from "@/agent-html/ast/types"

export type AgentHtmlInteractionUnitKind = "block"
export type AgentHtmlInteractionUnitRole = "flow-block"

export type AgentHtmlInteractionUnit = {
  kind: AgentHtmlInteractionUnitKind
  motionKey: string
  parentPath?: string
  parentTag?: AgentHtmlTag | string
  path: string
  role: AgentHtmlInteractionUnitRole
  tag: AgentHtmlTag | string
}

export type AgentHtmlNestedInteractionBlock = {
  parent: string
  child: string
}

export type AgentHtmlInteractionDiagnostics = {
  ok: boolean
  nestedBlocks: AgentHtmlNestedInteractionBlock[]
  duplicateBlocks: string[]
}

export type AgentHtmlInteractionUnits = {
  blocks: AgentHtmlInteractionUnit[]
  diagnostics: AgentHtmlInteractionDiagnostics
}
