export type AgentHtmlDropIntent =
  | { type: "before"; targetPath: string }
  | { type: "after"; targetPath: string }
  | { type: "inside"; targetPath: string }
  | { type: "column-before"; targetPath: string }
  | { type: "column-after"; targetPath: string }

export type ApplyAgentHtmlDropIntentInput = {
  intent: AgentHtmlDropIntent
  sourcePath: string
}
