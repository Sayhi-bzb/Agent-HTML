import * as React from "react"

import type { PetPresence } from "@/app/workspace/agent-presence"
import type { ProjectThreadPickerItem } from "@/app/workspace/thread-picker-model"
import type { AgentHtmlAgentPromptSubmitInput } from "@/agent-html"

export type WorkspacePetHostSnapshot = {
  canInterruptTurn?: boolean
  draftScope: string | null
  enabled: boolean
  isInterruptingTurn?: boolean
  onInterruptTurn?: () => void
  onNewThread?: () => void
  onPromptSubmit?: (submit: AgentHtmlAgentPromptSubmitInput) => void
  onRenameThread?: (input: { name: string; threadId: string }) => Promise<void>
  onResumeThread?: (threadId: string) => void
  presence?: PetPresence
  threadPickerContent?: React.ReactNode
  threads?: {
    canSelectThread: boolean
    error?: string | null
    isLoading: boolean
    isSelectingThread: boolean
    items: ProjectThreadPickerItem[]
  }
}

const disabledSnapshot: WorkspacePetHostSnapshot = {
  draftScope: null,
  enabled: false,
}

let currentSnapshot = disabledSnapshot
const listeners = new Set<() => void>()

export function clearWorkspacePetHost() {
  publishWorkspacePetHost(disabledSnapshot)
}

export function getWorkspacePetHostSnapshot() {
  return currentSnapshot
}

export function publishWorkspacePetHost(snapshot: WorkspacePetHostSnapshot) {
  currentSnapshot = snapshot.enabled ? snapshot : disabledSnapshot
  for (const listener of listeners) {
    listener()
  }
}

export function subscribeWorkspacePetHost(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
