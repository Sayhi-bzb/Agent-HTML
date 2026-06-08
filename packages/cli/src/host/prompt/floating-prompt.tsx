import * as React from "react"
import { ArrowUpIcon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#agent-html-playground/components/ui/tooltip"
import type { FloatingPromptTarget } from "../host-contracts"
import { HostIconButton } from "../ui/icon-button"
import {
  HostFloatingPromptActions,
  HostFloatingPromptStatus,
  HostFloatingPromptSurface,
  HostFloatingPromptTextarea,
} from "../ui/prompt"

export function FloatingPrompt({
  onDraftChange,
  onSubmit,
  status,
  target,
  value,
}: {
  onDraftChange: (draft: string) => void
  onSubmit: (input: {
    request: string
    target: FloatingPromptTarget
  }) => Promise<void>
  status: string
  target: FloatingPromptTarget
  value: string
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    setIsSubmitting(false)
  }, [target.id])

  async function submit() {
    const request = value.trim()

    if (!request || !target || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({ request, target })
      onDraftChange("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <HostFloatingPromptSurface targetId={target.id}>
        <HostFloatingPromptTextarea
          onChange={(event) => onDraftChange(event.currentTarget.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault()
              void submit()
            }
          }}
          placeholder="Edit this block..."
          value={value}
        />
        <HostFloatingPromptActions>
          <Tooltip>
            <TooltipTrigger asChild>
              <HostIconButton
                disabled={!value.trim() || isSubmitting}
                icon={ArrowUpIcon}
                label="Send"
                onClick={() => {
                  void submit()
                }}
                placement="prompt"
                size="icon-sm"
                tone="primary"
                variant="default"
              />
            </TooltipTrigger>
            <TooltipContent>Send</TooltipContent>
          </Tooltip>
        </HostFloatingPromptActions>
      </HostFloatingPromptSurface>
      {status ? (
        <HostFloatingPromptStatus>
          {status}
        </HostFloatingPromptStatus>
      ) : null}
    </TooltipProvider>
  )
}
