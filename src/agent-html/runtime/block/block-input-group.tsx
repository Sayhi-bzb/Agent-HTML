import * as React from "react"
import { ArrowUpIcon, PlusIcon } from "lucide-react"

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
import { cn } from "@/agent-html/lib/utils"

export function AgentHtmlBlockInputGroup({
  onPointerDown,
}: {
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>
}) {
  return (
    <TooltipProvider>
      <InputGroup
        className="bg-background/95 shadow-[0_18px_48px_-30px_color-mix(in_oklab,var(--foreground)_45%,transparent)] backdrop-blur"
        onPointerDown={onPointerDown}
      >
        <InputGroupTextarea placeholder="Ask, Search or Chat..." />
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
