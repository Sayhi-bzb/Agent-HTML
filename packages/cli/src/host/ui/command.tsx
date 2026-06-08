import type * as React from "react"

import {
  CommandDialog,
  CommandItem,
} from "#agent-html-playground/components/ui/command"
import { HostItemContent, type HostItemIcon } from "./item-content"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostCommandDialog({
  className,
  ...props
}: React.ComponentProps<typeof CommandDialog>) {
  return (
    <CommandDialog className={className ?? "sm:max-w-md"} {...props} />
  )
}

export function HostCommandItem({
  caption,
  className,
  icon,
  label,
  swatchColor,
  ...props
}: Omit<React.ComponentProps<typeof CommandItem>, "children"> & {
  caption?: React.ReactNode
  icon?: HostItemIcon
  label: React.ReactNode
  swatchColor?: string
}) {
  return (
    <CommandItem className={cn("canvas-host-command-item", className)} {...props}>
      <HostItemContent
        caption={caption}
        icon={icon}
        label={label}
        swatchColor={swatchColor}
      />
    </CommandItem>
  )
}
