import type {
  CodexApprovalDecision,
  CodexApprovalRequest,
  CodexThreadSummary,
} from "@/app/codex/connection/types"
import type {
  PetPresence,
  PetSpeechBubble,
} from "@/app/workspace/agent-presence"
import type { AgentHtmlAgentPromptSubmitInput } from "@/agent-html"
import type {
  CodexThreadPickerItem,
  ThreadPreviewState,
} from "@/app/workspace/thread-picker-model"
import type { ThreadTranscriptTurn } from "@/app/workspace/thread-transcript"

export type WorkspacePetThreadPanelState = {
  activeThreadId?: string | null
  canSelectThread: boolean
  codexThreadError?: string | null
  companyAgentError?: string | null
  isLoading: boolean
  isSelectingThread: boolean
  items: CodexThreadPickerItem[]
  optimisticThreadNames: Record<string, string>
  renameError?: string | null
  renamingThreadId?: string | null
  threadRequestPreviews: Record<string, ThreadPreviewState>
  threadSelectionError?: string | null
  threadSummaries: CodexThreadSummary[]
  transcript: {
    error?: string | null
    isLoading: boolean
    threadId?: string | null
    turns: ThreadTranscriptTurn[]
  }
}

export type WorkspacePetHostSnapshot = {
  canInterruptTurn?: boolean
  draftScope: string | null
  enabled: boolean
  isInterruptingTurn?: boolean
  messageDraft: string
  onInterruptTurn?: () => void
  onMessageDraftChange: (draft: string) => void
  onNewThread?: () => void
  onPromptSubmit?: (submit: AgentHtmlAgentPromptSubmitInput) => void
  onRespondToApproval?: (decision: CodexApprovalDecision) => void
  onRenameThread?: (input: { name: string; threadId: string }) => Promise<void>
  onResumeThread?: (threadId: string) => void
  presence?: PetPresence
  approval?: CodexApprovalRequest | null
  approvalError?: string | null
  speechBubbles?: PetSpeechBubble[]
  threadPanel?: WorkspacePetThreadPanelState
}

const disabledSnapshot: WorkspacePetHostSnapshot = {
  draftScope: null,
  enabled: false,
  messageDraft: "",
  onMessageDraftChange: () => {},
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
