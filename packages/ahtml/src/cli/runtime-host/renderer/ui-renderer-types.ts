import type { ReactNode } from "react"

import type {
  AgentComponentNode,
  RendererPath,
  RendererSpecComponent,
  RendererTextMode,
} from "./types"

export type UiRendererContext = {
  getComponentMetadataProps: (
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) => Record<string, string>
  renderChildren: (
    node: AgentComponentNode,
    path: RendererPath,
    textMode?: RendererTextMode,
  ) => ReactNode
  renderInlineChildren: (
    node: AgentComponentNode,
    path: RendererPath,
    textMode?: RendererTextMode,
  ) => ReactNode
  rendererSpecByName: Map<string, RendererSpecComponent>
}

export type UiRenderer = (
  node: AgentComponentNode,
  rendererSpec: RendererSpecComponent,
  path: RendererPath,
) => ReactNode

export type FieldSemantics = {
  controlId: string
  labelId?: string
  descriptionId?: string
}

export type ComboboxRendererItem = {
  value: string
  label: string
  description?: string
}
