import { BotIcon, SparklesIcon, WaypointsIcon } from "lucide-react"

import {
  ShellActionButton,
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
          <ShellActionButton
            ariaLabel="Draft proposal"
            className="app-shell-plain-action"
            disabled={proposalLocked}
            onClick={onDraftProposal}
            variant="ghost"
          >
            <SparklesIcon data-icon="inline-start" />
            Draft
          </ShellActionButton>
          <ShellActionButton
            ariaLabel="Run review check"
            className="app-shell-plain-action"
            disabled={runtimeCheckLocked}
            onClick={onRuntimeCheck}
            variant="ghost"
          >
            <WaypointsIcon data-icon="inline-start" />
            Check
          </ShellActionButton>
        </>
      }
    />
  )
}
