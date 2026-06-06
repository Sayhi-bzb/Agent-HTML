import * as React from "react"

import type { AgentHtmlDropIntent } from "@/agent-html/edit/types"
import type { AgentHtmlInteractionUnit } from "@/agent-html/interaction/types"
import type {
  AgentHtmlAgentPromptSubmitInput,
} from "@/agent-html/runtime/agent-events/types"
import type {
  AgentHtmlBlockDropIndicator,
  AgentHtmlBlockRuntimeState,
} from "@/agent-html/runtime/block/types"

export type AgentHtmlBlockRuntimeContextValue = AgentHtmlBlockRuntimeState & {
  clearIndicator: () => void
  closeBlockInput: () => void
  getBlockElement: (path: string) => HTMLElement | null
  getBlockElements: () => HTMLElement[]
  getHoveredBlockElement: () => HTMLElement | null
  getOverlayElement: () => HTMLElement | null
  getVisibleBlockRects: () => DOMRect[]
  registerBlockElement: (
    path: string,
    element: HTMLElement | null
  ) => () => void
  registerBlockPreview: (path: string, preview: React.ReactNode) => () => void
  registerBlockUnit: (path: string, unit: AgentHtmlInteractionUnit) => () => void
  registerOverlayElement: (element: HTMLElement | null) => () => void
  openBlockInput: (path: string, anchorElement: HTMLElement) => void
  refreshDragIntent: () => void
  setActiveBlock: (block: AgentHtmlBlockRuntimeIdentity | null) => void
  setHoveredBlock: (block: AgentHtmlBlockRuntimeIdentity | null) => void
  setIndicator: (indicator: AgentHtmlBlockDropIndicator | null) => void
}

export type AgentHtmlBlockRuntimeIdentity = {
  motionKey: string
  path: string
}

export type AgentHtmlClientPointer = {
  x: number
  y: number
}

export type AgentHtmlBlockRuntimeProviderProps = {
  children: React.ReactNode
  onDropIntent?: (input: {
    intent: AgentHtmlDropIntent
    sourcePath: string
  }) => void
  onPromptSubmit?: (input: AgentHtmlAgentPromptSubmitInput) => void
}

export const AgentHtmlBlockRuntimeContext =
  React.createContext<AgentHtmlBlockRuntimeContextValue | null>(null)
