import type { CommandState } from "./types"

type CommandLocks = {
  sessionNavigationLocked: boolean
  workbenchInteractionLocked: boolean
  sourceEditingLocked: boolean
}

export function deriveCommandLocks(commandState: CommandState): CommandLocks {
  const sessionInteractionLocked =
    commandState.loading ||
    commandState.saving ||
    commandState.validating ||
    commandState.building ||
    commandState.inspecting

  return {
    sessionNavigationLocked: sessionInteractionLocked,
    workbenchInteractionLocked: sessionInteractionLocked,
    sourceEditingLocked: sessionInteractionLocked,
  }
}
