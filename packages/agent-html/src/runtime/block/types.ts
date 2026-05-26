export type AgentHtmlBlockDropIndicator =
  | { type: "before"; targetPath: string }
  | { type: "after"; targetPath: string }
  | { type: "inside"; targetPath: string }
  | { type: "column-before"; targetPath: string }
  | { type: "column-after"; targetPath: string }

export type AgentHtmlBlockRuntimeState = {
  activeMotionKey: string | null
  activePath: string | null
  hoveredMotionKey: string | null
  hoveredPath: string | null
  indicator: AgentHtmlBlockDropIndicator | null
  landingMotionKey: string | null
}
