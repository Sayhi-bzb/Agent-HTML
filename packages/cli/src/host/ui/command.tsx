import type * as React from "react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
    <CommandDialog
      className={cn("canvas-host-command-dialog sm:max-w-md", className)}
      {...props}
    />
  )
}

export function HostCommand({
  className,
  ...props
}: React.ComponentProps<typeof Command>) {
  return <Command className={cn("canvas-host-command", className)} {...props} />
}

export function HostCommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandInput>) {
  return (
    <CommandInput
      className={cn("canvas-host-command-input", className)}
      {...props}
    />
  )
}

export function HostCommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandList>) {
  return (
    <CommandList
      className={cn("canvas-host-command-list", className)}
      {...props}
    />
  )
}

export function HostCommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandEmpty>) {
  return (
    <CommandEmpty
      className={cn("canvas-host-command-empty", className)}
      {...props}
    />
  )
}

export function HostCommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandGroup>) {
  return (
    <CommandGroup
      className={cn("canvas-host-command-group", className)}
      {...props}
    />
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
