import * as React from "react"
import { ArrowUpIcon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#agent-html-playground/components/ui/tooltip"
import type { FloatingPromptTarget } from "../host-contracts"
import { useHostI18n } from "../i18n/host-i18n"
import { HostIconButton } from "../ui/icon-button"
import {
  HostFloatingPromptActions,
  HostFloatingPromptStatus,
  HostFloatingPromptSurface,
  HostFloatingPromptTextarea,
} from "../ui/prompt"

export function shouldPublishPromptDraftChange({
  isComposing,
}: {
  isComposing: boolean
}) {
  return !isComposing
}

export function shouldSubmitPromptShortcut({
  ctrlKey,
  isComposing,
  key,
  metaKey,
  nativeIsComposing,
}: {
  ctrlKey: boolean
  isComposing: boolean
  key: string
  metaKey: boolean
  nativeIsComposing: boolean
}) {
  if (isComposing || nativeIsComposing) {
    return false
  }

  return (metaKey || ctrlKey) && key === "Enter"
}

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
  const { t } = useHostI18n()
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

            if (
              shouldPublishPromptDraftChange({
                isComposing: isComposingRef.current,
              })
            ) {
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
              shouldSubmitPromptShortcut({
                ctrlKey: event.ctrlKey,
                isComposing: isComposingRef.current,
                key: event.key,
                metaKey: event.metaKey,
                nativeIsComposing: event.nativeEvent.isComposing,
              })
            ) {
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
                label={t("prompt.send")}
                onClick={() => {
                  void submit()
                }}
                placement="prompt"
                size="icon-sm"
                tone="primary"
                variant="default"
              />
            </TooltipTrigger>
            <TooltipContent>{t("prompt.send")}</TooltipContent>
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
  const { t } = useHostI18n()

  return (
    <PromptComposer
      onDraftChange={onDraftChange}
      onSubmit={(request) => onSubmit({ request, target })}
      placeholder={t("prompt.editBlock")}
      status={status}
      targetId={target.id}
      value={value}
    />
  )
}
