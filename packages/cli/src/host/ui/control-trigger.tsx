import type * as React from "react"
import { Slot } from "radix-ui"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostControlTrigger({
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      className={cn("canvas-host-control-trigger", className)}
      {...props}
    />
  )
}
