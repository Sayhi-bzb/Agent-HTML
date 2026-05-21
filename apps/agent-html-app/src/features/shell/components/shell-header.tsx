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
          <ShellActionButton disabled={proposalLocked} onClick={onDraftProposal}>
            <SparklesIcon data-icon="inline-start" />
            Draft
          </ShellActionButton>
          <ShellActionButton disabled={runtimeCheckLocked} onClick={onRuntimeCheck}>
            <WaypointsIcon data-icon="inline-start" />
            Check
          </ShellActionButton>
        </>
      }
    />
  )
}
