import type { CommandState } from "./types"

type CommandLocks = {
  sessionNavigationLocked: boolean
  workbenchInteractionLocked: boolean
  sourceEditingLocked: boolean
  shellComposeLocked: boolean
  proposalLocked: boolean
  runtimeCheckLocked: boolean
}

export function deriveCommandLocks(commandState: CommandState): CommandLocks {
  const sessionInteractionLocked =
    commandState.loading ||
    commandState.saving ||
    commandState.validating ||
    commandState.building ||
    commandState.inspecting ||
    commandState.sending ||
    commandState.drafting

  return {
    sessionNavigationLocked: sessionInteractionLocked,
    workbenchInteractionLocked: sessionInteractionLocked,
    sourceEditingLocked: sessionInteractionLocked,
    shellComposeLocked: sessionInteractionLocked,
    proposalLocked: sessionInteractionLocked,
    runtimeCheckLocked: sessionInteractionLocked || commandState.checking,
  }
}
