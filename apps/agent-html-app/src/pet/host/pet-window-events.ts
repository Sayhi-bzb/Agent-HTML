import type { PetPresence } from "@/app/workspace/agent-presence"
import type { ProjectThreadPickerItem } from "@/app/workspace/thread-picker-model"

export const PET_WINDOW_LABEL = "pet"
export const PET_WINDOW_COMMAND_EVENT = "agent-html:pet-command"
export const PET_WINDOW_READY_EVENT = "agent-html:pet-ready"
export const PET_WINDOW_STATE_EVENT = "agent-html:pet-state"

export type PetWindowState = {
  draftScope: string | null
  enabled: boolean
  presence?: PetPresence
  threads?: {
    canSelectThread: boolean
    error?: string | null
    isLoading: boolean
    isSelectingThread: boolean
    items: ProjectThreadPickerItem[]
  }
}

export type PetWindowCommand =
  | {
      prompt: string
      type: "send-prompt"
    }
  | {
      type: "new-thread"
    }
  | {
      threadId: string
      type: "resume-thread"
    }
  | {
      name: string
      threadId: string
      type: "rename-thread"
    }
