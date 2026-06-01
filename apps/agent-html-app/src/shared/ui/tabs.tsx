import * as React from "react"

import {
  Tabs,
  TabsContent,
  TabsList as RuntimeTabsList,
  TabsTrigger as RuntimeTabsTrigger,
} from "@/agent-html/runtime/ui/tabs"

function TabsList(props: React.ComponentProps<typeof RuntimeTabsList>) {
  return <RuntimeTabsList data-selection="none" {...props} />
}

function TabsTrigger(props: React.ComponentProps<typeof RuntimeTabsTrigger>) {
  return (
    <RuntimeTabsTrigger
      data-selection="none"
      data-cursor="action"
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
