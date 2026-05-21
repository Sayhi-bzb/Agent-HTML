import { BotIcon, SparklesIcon, WaypointsIcon } from "lucide-react"

import {
  ShellIconButton,
  ShellPaneHeader,
  ShellPaneLabel,
} from "@/features/app-shell/components/shell-content"

type ShellHeaderProps = {
  proposalLocked: boolean
  runtimeCheckLocked: boolean
  onDraftProposal: () => void
  onRuntimeCheck: () => void
}

export function ShellHeader({
  proposalLocked,
  runtimeCheckLocked,
  onDraftProposal,
  onRuntimeCheck,
}: ShellHeaderProps) {
  return (
    <ShellPaneHeader
      leading={
        <ShellPaneLabel
          icon={<BotIcon className="app-shell-inline-icon" />}
          title="Review"
        />
      }
      trailing={
        <>
          <ShellIconButton
            ariaLabel="Draft proposal"
            className="app-shell-plain-icon"
            disabled={proposalLocked}
            onClick={onDraftProposal}
            tooltip="Draft proposal"
            variant="ghost"
          >
            <SparklesIcon data-icon="inline-start" />
          </ShellIconButton>
          <ShellIconButton
            ariaLabel="Run review check"
            className="app-shell-plain-icon"
            disabled={runtimeCheckLocked}
            onClick={onRuntimeCheck}
            tooltip="Run check"
            variant="ghost"
          >
            <WaypointsIcon data-icon="inline-start" />
          </ShellIconButton>
        </>
      }
    />
  )
}
