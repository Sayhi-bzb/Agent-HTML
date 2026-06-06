import * as React from "react"

import { cn } from "@/agent-html/lib/utils"

function RuntimeSkeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      data-slot="runtime-skeleton"
      {...props}
    />
  )
}

export { RuntimeSkeleton }
