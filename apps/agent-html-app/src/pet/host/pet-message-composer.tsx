import { cn } from "@/app/shared/lib/utils"
import {
  type AgentHtmlAgentPromptSubmitInput,
  AgentHtmlPromptComposer,
  type AgentHtmlPromptComposerSurface,
} from "@/agent-html"

export function PetMessageComposer({
  className,
  draft,
  onDraftChange,
  onPromptSubmit,
  onSent,
  surface,
}: {
  className?: string
  draft: string
  onDraftChange: (draft: string) => void
  onPromptSubmit?: (submit: AgentHtmlAgentPromptSubmitInput) => void
  onSent?: () => void
  surface?: AgentHtmlPromptComposerSurface
}) {
  return (
    <AgentHtmlPromptComposer
      className={cn(className)}
      onPointerDown={(event) => event.stopPropagation()}
      onSend={(prompt) => {
        onDraftChange("")
        onPromptSubmit?.({
          prompt,
        })
        onSent?.()
      }}
      onValueChange={onDraftChange}
      surface={surface}
      value={draft}
    />
  )
}
