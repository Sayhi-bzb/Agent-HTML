import { EyeIcon, FileCode2Icon, HammerIcon, InspectIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShellPaneHeader } from "@/features/app-shell/components/shell-content"
import type { WorkbenchView } from "@/lib/types"

type WorkbenchHeaderProps = {
  activeView: WorkbenchView
  interactionLocked: boolean
  onViewChange: (view: WorkbenchView) => void
  onBuild: () => void
  onInspect: () => void
}

export function WorkbenchHeader({
  activeView,
  interactionLocked,
  onViewChange,
  onBuild,
  onInspect,
}: WorkbenchHeaderProps) {
  return (
    <ShellPaneHeader
      gap="base"
      leading={
        <Tabs onValueChange={(value) => onViewChange(value as WorkbenchView)} value={activeView}>
          <TabsList>
            <TabsTrigger disabled={interactionLocked} value="preview">
              <EyeIcon data-icon="inline-start" />
              Preview
            </TabsTrigger>
            <TabsTrigger disabled={interactionLocked} value="source">
              <FileCode2Icon data-icon="inline-start" />
              Source
            </TabsTrigger>
            <TabsTrigger disabled={interactionLocked} value="inspect">
              <InspectIcon data-icon="inline-start" />
              Inspect
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
      trailing={
        <>
          <Button
            disabled={interactionLocked}
            onClick={onBuild}
            size="sm"
            type="button"
            variant="outline"
          >
            <HammerIcon data-icon="inline-start" />
            Build
          </Button>
          <Button
            disabled={interactionLocked}
            onClick={onInspect}
            size="sm"
            type="button"
            variant="outline"
          >
            <InspectIcon data-icon="inline-start" />
            Inspect
          </Button>
        </>
      }
    />
  )
}
