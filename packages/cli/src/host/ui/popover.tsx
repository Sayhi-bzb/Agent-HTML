import type * as React from "react"
import { CheckIcon } from "lucide-react"

import { Button } from "#agent-html-playground/components/ui/button"
import { PopoverContent } from "#agent-html-playground/components/ui/popover"
import { HostItemContent, type HostItemIcon } from "./item-content"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostPopoverContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverContent>) {
  return (
    <PopoverContent
      className={cn("canvas-host-floating-content", className)}
      {...props}
    />
  )
}

export function HostPopoverAction({
  active = false,
  caption,
  className,
  icon,
  label,
  swatchColor,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "children"> & {
  active?: boolean
  caption?: React.ReactNode
  icon?: HostItemIcon
  label: React.ReactNode
  swatchColor?: string
}) {
  return (
    <Button
      className={cn("canvas-host-popover-action", className)}
      data-active={active || undefined}
      type="button"
      variant="ghost"
      {...props}
    >
      <HostItemContent
        caption={caption}
        icon={icon}
        label={label}
        swatchColor={swatchColor}
        trailing={active ? <CheckIcon className="canvas-host-item-icon" /> : null}
      />
    </Button>
  )
}
