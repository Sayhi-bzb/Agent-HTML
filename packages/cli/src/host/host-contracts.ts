export type Artifact = {
  blocks: ArtifactBlock[]
  filePath: string
  title: string
}

export type ArtifactBlock = {
  id: string
  title: string
}

export type GuardIssue = {
  category?: "dependency" | "manifest" | "protocol" | "style" | "workspace"
  code?: string
  column?: number
  filePath: string
  guardScope?: string
  line: number
  message: string
  policyVersion?: number
  severity: string
  suggestion?: string
}

export type ArtifactModule = {
  mount: (element: HTMLElement) => () => void
}

declare global {
  interface Window {
    __AGENT_HTML_STATIC_ARTIFACTS__?: Record<string, ArtifactModule>
  }

  var __AGENT_HTML_STATIC_ARTIFACTS__:
    | Record<string, ArtifactModule>
    | undefined
}

export type BlockOverlay = {
  element: HTMLElement
  height: number
  id: string
  title: string
  width: number
  x: number
  y: number
}

export type BlockMessageItemKind =
  | "request"
  | "reasoning"
  | "tool_use"
  | "observe"
  | "action"
  | "response"
  | "status"

export type BlockMessagePhase = "idle" | "running" | "done" | "failed"

export type BlockMessageItem = {
  id: string
  kind: BlockMessageItemKind
  status?: "done" | "failed" | "loading"
  summary: string
  title: string
}

export type BlockMessageThread = {
  blockId: string
  filePath: string
  id: string
  isOpen: boolean
  items: BlockMessageItem[]
  phase: BlockMessagePhase
  readAt?: number | null
  title: string
  threadId?: string
  turnId?: string | null
}

export type CanvasTarget = {
  blockId: string
  filePath: string
  implementationPath?: string
}

export type PromptTarget = {
  id: string
  title: string
}

export type FloatingPromptTarget = PromptTarget & {
  anchorElement: HTMLElement
  triggerElement: HTMLElement
}
