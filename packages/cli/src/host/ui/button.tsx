import type * as React from "react"

import { Button } from "#agent-html-playground/components/ui/button"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("canvas-host-button", className)}
      {...props}
    />
  )
}
