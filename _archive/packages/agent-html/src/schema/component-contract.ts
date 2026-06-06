import type { AgentHtmlTag } from "@/agent-html/ast/types"

export type AgentHtmlComponentKind = "layout" | "ui"

export type AgentHtmlComponentRole =
  | "layout"
  | "component"
  | "part"
  | "data"
  | "utility"

export type AgentHtmlComponentRuntime =
  | "layout-special"
  | "component-map"
  | "special-renderer"
  | "data-only"

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

export type AgentHtmlComponentMarketCategory =
  | "content"
  | "data"
  | "display"
  | "feedback"
  | "form"
  | "layout"
  | "media"
  | "navigation"

export type AgentHtmlComponentMarketContract = {
  category: AgentHtmlComponentMarketCategory
  configurableAttrs?: readonly string[]
  insertTemplate: string
  previewExample: string
  summary: string
  title: string
}

export type AgentHtmlComponentContract = {
  attrs?: Record<string, AgentHtmlAttrContract>
  children: AgentHtmlChildrenContract
  kind: AgentHtmlComponentKind
  market?: AgentHtmlComponentMarketContract
  promptSignature?: string
  role?: AgentHtmlComponentRole
  runtime?: AgentHtmlComponentRuntime
  tag: AgentHtmlTag
}

export function defineAgentHtmlComponent(
  contract: AgentHtmlComponentContract
) {
  return contract
}
