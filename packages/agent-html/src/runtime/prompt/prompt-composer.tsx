import * as React from "react"
import { ArrowUpIcon, PlusIcon } from "lucide-react"

import { cn } from "@/agent-html/lib/utils"
import { buttonVariants } from "@/agent-html/runtime/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "@/agent-html/runtime/ui/input-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/agent-html/runtime/ui/tooltip"

export type AgentHtmlPromptComposerSurface = "default" | "floating"

const promptComposerSurfaceClassName: Record<
  AgentHtmlPromptComposerSurface,
  string
> = {
  default:
    "bg-background/95 shadow-[0_18px_48px_-30px_color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur",
  floating: "bg-background/75 shadow-none backdrop-blur-md",
}

export function AgentHtmlPromptComposer({
  className,
  onPointerDown,
  onSend,
  onValueChange,
  surface = "default",
  value,
}: {
  className?: string
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>
  onSend?: (prompt: string) => void
  onValueChange?: (value: string) => void
  surface?: AgentHtmlPromptComposerSurface
  value?: string
}) {
  const [uncontrolledPrompt, setUncontrolledPrompt] = React.useState("")
  const isControlled = value !== undefined
  const prompt = isControlled ? value : uncontrolledPrompt
  const canSend = prompt.trim().length > 0
  const setPrompt = React.useCallback(
    (nextPrompt: string) => {
      if (!isControlled) {
        setUncontrolledPrompt(nextPrompt)
      }
      onValueChange?.(nextPrompt)
    },
    [isControlled, onValueChange]
  )

  function handleSend() {
    const nextPrompt = prompt.trim()
    if (!nextPrompt) {
      return
    }

    onSend?.(nextPrompt)
    setPrompt("")
  }

  return (
    <TooltipProvider>
      <InputGroup
        className={cn(promptComposerSurfaceClassName[surface], className)}
        onPointerDown={onPointerDown}
      >
        <InputGroupTextarea
          onChange={(event) => {
            setPrompt(event.currentTarget.value)
          }}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault()
              handleSend()
            }
          }}
          placeholder="Ask, Search or Chat..."
          value={prompt}
        />
        <InputGroupAddon align="block-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Add context"
                className={cn(
                  buttonVariants({ size: "icon-sm", variant: "ghost" }),
                  "rounded-full"
                )}
                type="button"
              >
                <PlusIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent>Add context</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Send"
                className={cn(
                  buttonVariants({ size: "icon-sm", variant: "default" }),
                  "ml-auto rounded-full"
                )}
                disabled={!canSend}
                onClick={handleSend}
                type="button"
              >
                <ArrowUpIcon />
              </button>
            </TooltipTrigger>
            <TooltipContent>Send</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
    </TooltipProvider>
  )
}
