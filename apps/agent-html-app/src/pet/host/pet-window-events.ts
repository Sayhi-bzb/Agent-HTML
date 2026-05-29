import type { PetPresence } from "@/app/workspace/agent-presence"

export const PET_WINDOW_LABEL = "pet"
export const PET_WINDOW_COMMAND_EVENT = "agent-html:pet-command"
export const PET_WINDOW_READY_EVENT = "agent-html:pet-ready"
export const PET_WINDOW_STATE_EVENT = "agent-html:pet-state"

export type PetWindowState = {
  draftScope: string | null
  enabled: boolean
  presence?: PetPresence
}

export type PetWindowCommand = {
  prompt: string
  type: "send-prompt"
}
