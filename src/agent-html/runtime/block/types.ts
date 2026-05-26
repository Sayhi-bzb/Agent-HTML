export type AgentHtmlBlockDropIndicator =
  | { type: "before"; targetPath: string }
  | { type: "after"; targetPath: string }
  | { type: "inside"; targetPath: string }
  | { type: "column-before"; targetPath: string }
  | { type: "column-after"; targetPath: string }

export type AgentHtmlBlockRuntimeState = {
  activePath: string | null
  hoveredPath: string | null
  indicator: AgentHtmlBlockDropIndicator | null
}
