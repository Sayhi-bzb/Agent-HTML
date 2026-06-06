import type { AgentHtmlDropIntent } from "@/agent-html/edit/types"

export type AgentHtmlAgentInteractionEvent =
  | {
      kind: "kanban_item_moved"
      itemValue: string
      nextColumnValue: string
      nextIndex: number
      previousColumnValue: string
      previousIndex: number
    }
  | {
      kind: "block_moved"
      intent: AgentHtmlDropIntent
      sourcePath: string
    }

export type AgentHtmlAgentPromptSubmitInput = {
  interaction?: AgentHtmlAgentInteractionEvent | null
  prompt: string
  target?: {
    path: string
  }
}
