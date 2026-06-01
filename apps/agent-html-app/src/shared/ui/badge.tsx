import * as React from "react"

import { Badge as RuntimeBadge } from "@/agent-html/runtime/ui/badge"

function Badge(props: React.ComponentProps<typeof RuntimeBadge>) {
  return <RuntimeBadge data-selection="none" {...props} />
}

export { Badge }
