import * as React from "react"

import type {
  CodexApprovalDecision,
  CodexApprovalRequest,
} from "@/app/codex/connection/types"
import type {
  PetPresence,
  PetSpeechBubble,
} from "@/app/workspace/agent-presence"
import type { CodexThreadPickerItem } from "@/app/workspace/thread-picker-model"
import type { AgentHtmlAgentPromptSubmitInput } from "@/agent-html"

export type WorkspacePetHostSnapshot = {
  canInterruptTurn?: boolean
  draftScope: string | null
  enabled: boolean
  isInterruptingTurn?: boolean
  onInterruptTurn?: () => void
  onNewThread?: () => void
  onPromptSubmit?: (submit: AgentHtmlAgentPromptSubmitInput) => void
  onRespondToApproval?: (decision: CodexApprovalDecision) => void
  onRenameThread?: (input: { name: string; threadId: string }) => Promise<void>
  onResumeThread?: (threadId: string) => void
  presence?: PetPresence
  approval?: CodexApprovalRequest | null
  approvalError?: string | null
  speechBubbles?: PetSpeechBubble[]
  threadPickerContent?: React.ReactNode
  transcriptContent?: React.ReactNode
  threads?: {
    canSelectThread: boolean
    error?: string | null
    isLoading: boolean
    isSelectingThread: boolean
    items: CodexThreadPickerItem[]
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
