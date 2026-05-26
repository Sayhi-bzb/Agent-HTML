import * as React from "react"

import { cn } from "@/agent-html/lib/utils"
import { ScrollArea } from "@/agent-html/runtime/ui/scroll-area"

function IntrinsicScrollFrame({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea
      data-slot="intrinsic-scroll-frame"
      className={cn("w-full min-w-0", className)}
      {...props}
    >
      {children}
    </ScrollArea>
  )
}

export { IntrinsicScrollFrame }
