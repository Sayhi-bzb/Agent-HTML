import { CodeIcon, EyeIcon, InspectIcon } from "lucide-react"
import {
  ShellIconButton,
  ShellPaneHeader,
} from "@/features/app-shell/components/shell-content"
import type { WorkbenchView } from "@/lib/types"
import { cn } from "@/lib/utils"

type WorkbenchHeaderProps = {
  activeView: WorkbenchView
  interactionLocked: boolean
  onViewChange: (view: WorkbenchView) => void
}

export function WorkbenchHeader({
  activeView,
  interactionLocked,
  onViewChange,
}: WorkbenchHeaderProps) {
  return (
    <ShellPaneHeader
      trailing={
        <>
          <ShellIconButton
            ariaLabel="Open preview view"
            className={cn(activeView === "preview" && "text-shell-text-primary")}
            disabled={interactionLocked}
            onClick={() => onViewChange("preview")}
            tooltip="Preview"
          >
            <EyeIcon data-icon="inline-start" />
          </ShellIconButton>
          <ShellIconButton
            ariaLabel="Open source view"
            className={cn(activeView === "source" && "text-shell-text-primary")}
            disabled={interactionLocked}
            onClick={() => onViewChange("source")}
            tooltip="Source"
          >
            <CodeIcon data-icon="inline-start" />
          </ShellIconButton>
          <ShellIconButton
            ariaLabel="Open inspect review"
            className={cn(activeView === "inspect" && "text-shell-text-primary")}
            disabled={interactionLocked}
            onClick={() => onViewChange("inspect")}
            tooltip="Inspect"
          >
            <InspectIcon data-icon="inline-start" />
          </ShellIconButton>
        </>
      }
    />
  )
}
