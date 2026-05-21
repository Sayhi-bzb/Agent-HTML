import type { AgentNode, RendererPath, RendererPathSegment } from "../../types"

export function mergeClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ") || undefined
}

export function collapseTextNodeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function appendRendererPath(
  path: RendererPath,
  ...segments: RendererPathSegment[]
) {
  return [...path, ...segments]
}

export function renderInlineTextContent(children: AgentNode[]) {
  return children
    .map((child) => (child.type === "text" ? child.value : ""))
    .join("")
}
