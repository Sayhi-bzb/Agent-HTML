import type * as React from "react"

import {
  AgentHtmlPromptComposer,
  type AgentHtmlPromptComposerSurface,
} from "@/agent-html/runtime/prompt/prompt-composer"

export function AgentHtmlBlockInputGroup({
  onSend,
  onPointerDown,
  surface,
}: {
  onSend?: (prompt: string) => void
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>
  surface?: AgentHtmlPromptComposerSurface
}) {
  return (
    <AgentHtmlPromptComposer
      onPointerDown={onPointerDown}
      onSend={onSend}
      surface={surface}
    />
  )
}
