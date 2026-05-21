import { Tabs, TabsContent } from "@/components/ui/tabs"
import type { ReactNode } from "react"
import type { WorkbenchView } from "@/lib/types"

type WorkbenchTabsProps = {
  activeView: WorkbenchView
  preview: ReactNode
  source: ReactNode
  inspect: ReactNode
}

export function WorkbenchTabs({
  activeView,
  preview,
  source,
  inspect,
}: WorkbenchTabsProps) {
  return (
    <Tabs className="app-shell-fill-tabs" value={activeView}>
      <TabsContent className="app-shell-fill-tab-panel" value="preview">
        {preview}
      </TabsContent>

      <TabsContent className="app-shell-fill-tab-panel" value="source">
        {source}
      </TabsContent>

      <TabsContent className="app-shell-fill-tab-panel" value="inspect">
        {inspect}
      </TabsContent>
    </Tabs>
  )
}
