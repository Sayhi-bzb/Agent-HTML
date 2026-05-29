import * as React from "react"

import type { PetPresence } from "@/app/workspace/agent-presence"
import type { AgentHtmlAgentPromptSubmitInput } from "@/agent-html"

export type WorkspacePetHostSnapshot = {
  draftScope: string | null
  enabled: boolean
  onPromptSubmit?: (submit: AgentHtmlAgentPromptSubmitInput) => void
  presence?: PetPresence
  threadPickerContent?: React.ReactNode
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
