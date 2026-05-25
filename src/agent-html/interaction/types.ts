import type { AgentHtmlTag } from "@/agent-html/ast/types"

export type AgentHtmlInteractionUnitKind = "block" | "group" | "internal"

export type AgentHtmlInteractionUnit = {
  kind: AgentHtmlInteractionUnitKind
  path: string
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
