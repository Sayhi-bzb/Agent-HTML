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
  surface,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  icon: HostItemIcon
  label: string
  surface?: "block-action" | "prompt-submit" | "toolbar"
}) {
  return (
    <Button
      aria-label={label}
      className={cn(
        "canvas-host-icon-button",
        surface === "toolbar" && "canvas-host-toolbar-action",
        surface === "block-action" && "canvas-block-action",
        surface === "prompt-submit" && "canvas-floating-prompt-submit",
        className
      )}
      type="button"
      {...props}
    >
      <Icon data-icon="inline-start" />
    </Button>
  )
}
