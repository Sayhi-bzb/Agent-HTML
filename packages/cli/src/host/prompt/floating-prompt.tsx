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

export function PromptComposer({
  disabled,
  onDraftChange,
  onSubmit,
  placeholder,
  status,
  targetId,
  value,
}: {
  disabled?: boolean
  onDraftChange: (draft: string) => void
  onSubmit: (request: string) => Promise<void>
  placeholder: string
  status: string
  targetId: string
  value: string
}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [draftValue, setDraftValue] = React.useState(value)
  const isComposingRef = React.useRef(false)

  React.useEffect(() => {
    setIsSubmitting(false)
  }, [targetId])

  React.useEffect(() => {
    if (!isComposingRef.current) {
      setDraftValue(value)
    }
  }, [value])

  async function submit() {
    const request = draftValue.trim()

    if (!request || disabled || isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(request)
      onDraftChange("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <HostFloatingPromptSurface targetId={targetId}>
        <HostFloatingPromptTextarea
          disabled={disabled || isSubmitting}
          onChange={(event) => {
            const nextDraft = event.currentTarget.value
            setDraftValue(nextDraft)

            if (!isComposingRef.current) {
              onDraftChange(nextDraft)
            }
          }}
          onCompositionEnd={(event) => {
            isComposingRef.current = false
            setDraftValue(event.currentTarget.value)
            onDraftChange(event.currentTarget.value)
          }}
          onCompositionStart={() => {
            isComposingRef.current = true
          }}
          onKeyDown={(event) => {
            if (
              isComposingRef.current ||
              event.nativeEvent.isComposing
            ) {
              return
            }

            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault()
              void submit()
            }
          }}
          placeholder={placeholder}
          value={draftValue}
        />
        <HostFloatingPromptActions>
          <Tooltip>
            <TooltipTrigger asChild>
              <HostIconButton
                disabled={disabled || !draftValue.trim() || isSubmitting}
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
  return (
    <PromptComposer
      onDraftChange={onDraftChange}
      onSubmit={(request) => onSubmit({ request, target })}
      placeholder="Edit this block..."
      status={status}
      targetId={target.id}
      value={value}
    />
  )
}
