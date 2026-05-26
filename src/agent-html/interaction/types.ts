import type { AgentHtmlTag } from "@/agent-html/ast/types"

export type AgentHtmlInteractionUnitKind = "block" | "group" | "internal"
export type AgentHtmlInteractionUnitRole =
  | "flow-block"
  | "grid-item"
  | "internal-layout"

export type AgentHtmlInteractionUnit = {
  kind: AgentHtmlInteractionUnitKind
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
  blockGroupOverlap: string[]
  blockInternalOverlap: string[]
  groupInternalOverlap: string[]
  nestedBlocks: AgentHtmlNestedInteractionBlock[]
  duplicateBlocks: string[]
}

export type AgentHtmlInteractionUnits = {
  blocks: AgentHtmlInteractionUnit[]
  groups: AgentHtmlInteractionUnit[]
  internal: AgentHtmlInteractionUnit[]
  diagnostics: AgentHtmlInteractionDiagnostics
}
