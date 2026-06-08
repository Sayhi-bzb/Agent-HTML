import type * as React from "react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupTextarea,
} from "#agent-html-playground/components/ui/input-group"
import { PopoverContent } from "#agent-html-playground/components/ui/popover"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostFloatingPromptPopoverContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      className={cn("canvas-floating-prompt-popover", className)}
      {...props}
    />
  )
}

export function HostFloatingPromptSurface({
  children,
  targetId,
}: {
  children: React.ReactNode
  targetId: string
}) {
  return (
    <InputGroup
      className="canvas-floating-prompt"
      data-agent-html-floating-prompt="true"
      data-agent-html-floating-prompt-target={targetId}
    >
      {children}
    </InputGroup>
  )
}

export function HostFloatingPromptTextarea({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupTextarea>) {
  return (
    <InputGroupTextarea
      className={["canvas-floating-prompt-input", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  )
}

export function HostFloatingPromptActions({
  children,
}: {
  children: React.ReactNode
}) {
  return <InputGroupAddon align="block-end">{children}</InputGroupAddon>
}

export function HostFloatingPromptStatus({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <p className="canvas-floating-prompt-status" role="status">
      {children}
    </p>
  )
}
