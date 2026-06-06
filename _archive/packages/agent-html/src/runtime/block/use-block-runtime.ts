import * as React from "react"

import { AgentHtmlBlockRuntimeContext } from "@/agent-html/runtime/block/block-runtime-context"

export function useAgentHtmlBlockRuntime() {
  const context = React.useContext(AgentHtmlBlockRuntimeContext)

  if (!context) {
    throw new Error(
      "useAgentHtmlBlockRuntime must be used inside AgentHtmlBlockRuntimeProvider"
    )
  }

  return context
}
