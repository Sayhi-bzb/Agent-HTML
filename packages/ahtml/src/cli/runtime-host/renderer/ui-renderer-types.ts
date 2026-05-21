import type { CSSProperties, ReactNode } from "react"

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
  ) => {
    className?: string
    style?: CSSProperties
    "data-agent-html-component": string
    "data-ahtml-render-kind": string
    "data-ahtml-path": string
    "data-ahtml-source"?: string
    "data-ahtml-treatment"?: string
  }
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
