import * as React from "react"

import { Progress as RuntimeProgress } from "@/agent-html/runtime/ui/progress"

function Progress(props: React.ComponentProps<typeof RuntimeProgress>) {
  return <RuntimeProgress data-selection="none" {...props} />
}

export { Progress }
