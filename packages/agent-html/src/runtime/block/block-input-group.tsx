import type * as React from "react"

import { AgentHtmlPromptComposer } from "@/agent-html/runtime/prompt/prompt-composer"

export function AgentHtmlBlockInputGroup({
  onSend,
  onPointerDown,
}: {
  onSend?: (prompt: string) => void
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>
}) {
  return (
    <AgentHtmlPromptComposer onPointerDown={onPointerDown} onSend={onSend} />
  )
}
