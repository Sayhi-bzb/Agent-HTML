import * as React from "react"

import { CodeBlock } from "@/agent-html-example/features/source-viewer/code-block"
import type { SourceTabValue } from "@/agent-html-example/features/source-viewer/types"
import { ScrollArea, TabsContent } from "@/agent-html-example/ui"

export const SourcePanel = React.memo(function SourcePanel({
  ahtmlSource,
  htmlSource,
  reactSource,
  visitedTabs,
}: {
  ahtmlSource: string
  htmlSource: string
  reactSource: string
  visitedTabs: ReadonlySet<SourceTabValue>
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TabsContent
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
        forceMount
        value="ahtml"
      >
        <ScrollArea className="h-full w-full">
          <div className="min-w-max">
            {visitedTabs.has("ahtml") ? (
              <CodeBlock language="ahtml" source={ahtmlSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
        forceMount
        value="html"
      >
        <ScrollArea className="h-full w-full">
          <div className="min-w-max">
            {visitedTabs.has("html") ? (
              <CodeBlock language="html" source={htmlSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent
        className="mt-0 min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
        forceMount
        value="react"
      >
        <ScrollArea className="h-full w-full">
          <div className="min-w-max">
            {visitedTabs.has("react") ? (
              <CodeBlock language="react" source={reactSource} />
            ) : null}
          </div>
        </ScrollArea>
      </TabsContent>
    </div>
  )
})
