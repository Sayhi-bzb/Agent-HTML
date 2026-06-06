import * as React from "react"
import { ArrowUpIcon } from "lucide-react"

import { Button } from "#agent-html-playground/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "#agent-html-playground/components/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#agent-html-playground/components/ui/tooltip"
import type { FloatingPromptTarget } from "./host-contracts"

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
      <InputGroup
        className="canvas-floating-prompt"
        data-agent-html-floating-prompt="true"
        data-agent-html-floating-prompt-target={target.id}
      >
        <InputGroupTextarea
          className="canvas-floating-prompt-input"
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
        <InputGroupAddon align="block-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Send"
                className="ml-auto rounded-full"
                disabled={!value.trim() || isSubmitting}
                onClick={() => {
                  void submit()
                }}
                size="icon-sm"
                type="button"
                variant="default"
              >
                <ArrowUpIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
      {status ? (
        <p className="canvas-floating-prompt-status" role="status">
          {status}
        </p>
      ) : null}
    </TooltipProvider>
  )
}
