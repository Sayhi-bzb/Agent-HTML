import type * as React from "react"

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "#agent-html-playground/components/ui/dropdown-menu"
import { HostItemContent, type HostItemIcon } from "./item-content"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostDropdownContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      className={cn(
        "canvas-host-floating-content canvas-host-dropdown-content",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuContent>
  )
}

export function HostDropdownLabel({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuLabel>) {
  return (
    <DropdownMenuLabel
      className={cn("canvas-host-dropdown-label", className)}
      {...props}
    />
  )
}

export function HostDropdownItem({
  caption,
  className,
  icon,
  label,
  shortcut,
  swatchColor,
  ...props
}: Omit<React.ComponentProps<typeof DropdownMenuItem>, "children"> & {
  caption?: React.ReactNode
  icon?: HostItemIcon
  label: React.ReactNode
  shortcut?: React.ReactNode
  swatchColor?: string
}) {
  return (
    <DropdownMenuItem
      className={cn("canvas-host-dropdown-item", className)}
      {...props}
    >
      <HostItemContent
        caption={caption}
        icon={icon}
        label={label}
        shortcut={shortcut}
        swatchColor={swatchColor}
      />
    </DropdownMenuItem>
  )
}
