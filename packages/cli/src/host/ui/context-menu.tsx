import { ContextMenu as ContextMenuPrimitive } from "radix-ui"
import type * as React from "react"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostContextMenu(
  props: React.ComponentProps<typeof ContextMenuPrimitive.Root>
) {
  return <ContextMenuPrimitive.Root {...props} />
}

export function HostContextMenuTrigger(
  props: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>
) {
  return <ContextMenuPrimitive.Trigger {...props} />
}

export function HostContextMenuGroup(
  props: React.ComponentProps<typeof ContextMenuPrimitive.Group>
) {
  return <ContextMenuPrimitive.Group {...props} />
}

export function HostContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className={cn(
          "canvas-host-floating-content canvas-host-dropdown-content canvas-host-context-menu-content",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

export function HostContextMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item>) {
  return (
    <ContextMenuPrimitive.Item
      className={cn("canvas-host-dropdown-item", className)}
      {...props}
    />
  )
}

export function HostContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("canvas-host-context-menu-separator", className)}
      {...props}
    />
  )
}
