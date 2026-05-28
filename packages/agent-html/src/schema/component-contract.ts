import type { AgentHtmlTag } from "@/agent-html/ast/types"

export type AgentHtmlComponentKind = "layout" | "ui"

export type AgentHtmlAttrType = "string" | "number" | "boolean" | "enum"

export type AgentHtmlAttrContract = {
  defaultValue?: string
  prompt?: boolean
  required?: boolean
  type: AgentHtmlAttrType
  values?: readonly string[]
}

export type AgentHtmlChildrenContract = {
  grammar: string
  text?: boolean
}

export type AgentHtmlComponentContract = {
  attrs?: Record<string, AgentHtmlAttrContract>
  children: AgentHtmlChildrenContract
  kind: AgentHtmlComponentKind
  promptSignature?: string
  tag: AgentHtmlTag
}

export function defineAgentHtmlComponent(
  contract: AgentHtmlComponentContract
) {
  return contract
}
