import type { AgentHtmlAgentInteractionEvent } from "@/agent-html/runtime/agent-events/types"

export const agentHtmlInteractionEventName = "agent-html:interaction"

export function dispatchAgentHtmlInteractionEvent(
  detail: AgentHtmlAgentInteractionEvent
) {
  if (typeof window === "undefined") {
    return
  }

  window.dispatchEvent(
    new CustomEvent<AgentHtmlAgentInteractionEvent>(
      agentHtmlInteractionEventName,
      { detail }
    )
  )
}
