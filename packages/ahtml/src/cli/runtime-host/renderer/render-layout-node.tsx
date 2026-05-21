import React from "react"

import { resolveElement } from "./elements"
import type { RendererKind } from "./kinds"
import {
  applyPropMappings,
  getRendererPropMappings,
} from "./renderer-props"
import type {
  AgentComponentNode,
  RendererPath,
  RendererSpecComponent,
  RendererTextMode,
} from "./types"

type LayoutRendererContext = {
  getComponentMetadataProps: (
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) => Record<string, string>
  renderChildren: (
    node: AgentComponentNode,
    path: RendererPath,
    textMode?: RendererTextMode,
  ) => React.ReactNode
  renderInlineChildren: (
    node: AgentComponentNode,
    path: RendererPath,
    textMode?: RendererTextMode,
  ) => React.ReactNode
}

type LayoutRenderer = (
  node: AgentComponentNode,
  rendererSpec: RendererSpecComponent,
  path: RendererPath,
) => React.ReactNode

export function createLayoutRenderer(context: LayoutRendererContext) {
  function renderLayoutComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const props = {
      ...context.getComponentMetadataProps(node, rendererSpec, path),
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
    }
    const children =
      rendererSpec.childMode === "inline"
        ? context.renderInlineChildren(node, path, rendererSpec.textMode)
        : context.renderChildren(node, path, rendererSpec.textMode)

    return <Root {...props}>{children}</Root>
  }

  return {
    "layout-stack": renderLayoutComponent,
    "layout-cluster": renderLayoutComponent,
    "layout-split": renderLayoutComponent,
    "layout-grid": renderLayoutComponent,
    "layout-switcher": renderLayoutComponent,
    "layout-frame": renderLayoutComponent,
  } satisfies Partial<Record<RendererKind, LayoutRenderer>>
}
