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
            disabled={proposalLocked}
            onClick={onDraftProposal}
            tooltip="Draft proposal"
          >
            <SparklesIcon data-icon="inline-start" />
          </ShellIconButton>
          <ShellIconButton
            ariaLabel="Run review check"
            disabled={runtimeCheckLocked}
            onClick={onRuntimeCheck}
            tooltip="Run check"
          >
            <WaypointsIcon data-icon="inline-start" />
          </ShellIconButton>
        </>
      }
    />
  )
}
