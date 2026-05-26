import { cn } from "@/agent-html/lib/utils"
import { useAgentHtmlBlockRuntime } from "@/agent-html/runtime/block/block-runtime-provider"

export function AgentHtmlBlockIndicator() {
  const { indicator } = useAgentHtmlBlockRuntime()

  if (!indicator) {
    return null
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50 rounded-full bg-blue-500",
        indicator.type.startsWith("column") ? "h-12 w-0.5" : "h-0.5 w-24"
      )}
      data-agent-html-block-indicator={indicator.type}
      data-agent-html-block-indicator-target={indicator.targetPath}
    />
  )
}
