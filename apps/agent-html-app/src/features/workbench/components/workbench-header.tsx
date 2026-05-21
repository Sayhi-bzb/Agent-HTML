import { EyeIcon, FileCode2Icon, HammerIcon, InspectIcon } from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShellActionButton,
  ShellPaneHeader,
} from "@/features/app-shell/components/shell-content"
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
          <TabsList className="app-shell-tabs-list" variant="line">
            <TabsTrigger className="app-shell-tabs-trigger" disabled={interactionLocked} value="preview">
              <EyeIcon data-icon="inline-start" />
              Preview
            </TabsTrigger>
            <TabsTrigger className="app-shell-tabs-trigger" disabled={interactionLocked} value="source">
              <FileCode2Icon data-icon="inline-start" />
              Source
            </TabsTrigger>
            <TabsTrigger className="app-shell-tabs-trigger" disabled={interactionLocked} value="inspect">
              <InspectIcon data-icon="inline-start" />
              Inspect
            </TabsTrigger>
          </TabsList>
        </Tabs>
      }
      trailing={
        <>
          <ShellActionButton
            ariaLabel="Build preview"
            className="app-shell-plain-action"
            disabled={interactionLocked}
            onClick={onBuild}
            variant="ghost"
          >
            <HammerIcon data-icon="inline-start" />
            Build
          </ShellActionButton>
          <ShellActionButton
            ariaLabel="Open inspect review"
            className="app-shell-plain-action"
            disabled={interactionLocked}
            onClick={onInspect}
            variant="ghost"
          >
            <InspectIcon data-icon="inline-start" />
            Review
          </ShellActionButton>
        </>
      }
    />
  )
}
