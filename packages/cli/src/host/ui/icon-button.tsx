import type * as React from "react"

import { Button } from "#agent-html-playground/components/ui/button"
import type { HostItemIcon } from "./item-content"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostIconButton({
  className,
  icon: Icon,
  label,
  placement,
  tone = "neutral",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  icon: HostItemIcon
  label: string
  placement?: "blockOverlay" | "prompt" | "toolbar"
  tone?: "neutral" | "primary"
}) {
  return (
    <Button
      aria-label={label}
      className={cn(
        "canvas-host-icon-button",
        placement === "toolbar" && "canvas-host-toolbar-action",
        placement === "blockOverlay" && "canvas-block-action",
        placement === "prompt" && "canvas-floating-prompt-submit",
        className
      )}
      data-tone={tone}
      type="button"
      {...props}
    >
      <Icon data-icon="inline-start" />
    </Button>
  )
}
