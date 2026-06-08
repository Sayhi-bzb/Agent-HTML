export type Artifact = {
  blocks: ArtifactBlock[]
  filePath: string
}

export type ArtifactBlock = {
  id: string
  title: string
}

export type GuardIssue = {
  filePath: string
  guardScope?: string
  line?: number
  message: string
  severity: string
}

export type ArtifactModule = {
  mount: (element: HTMLElement) => () => void
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
