import * as React from "react"

import { ScrollArea } from "@/agent-html-example/ui"

export const RenderPanel = React.memo(function RenderPanel({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-full min-h-0 w-full min-w-0 overflow-hidden">
      <ScrollArea className="h-full w-full">
        <div className="w-full min-w-0 p-5">{children}</div>
      </ScrollArea>
    </div>
  )
})
