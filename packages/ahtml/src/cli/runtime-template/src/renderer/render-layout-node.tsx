import React from "react"

import { resolveElement } from "./elements"
import type { RendererKind } from "./kinds"
import type {
  AgentComponentNode,
  RendererPath,
  RendererPropMapping,
  RendererPropValue,
  RendererSpecComponent,
  RendererTextMode,
} from "./types"

type LayoutRendererContext = {
  getComponentMetadataProps: (
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
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
      ...context.getComponentMetadataProps(node, rendererSpec),
      ...applyPropMappings(node.props, rendererSpec.propMappings),
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

function applyPropMappings(
  props: Record<string, string>,
  propMappings?: RendererPropMapping[],
) {
  const mapped: Record<string, RendererPropValue> = {}

  for (const mapping of propMappings ?? []) {
    const value = props[mapping.prop]

    if (value === undefined) {
      continue
    }

    if (mapping.map) {
      const targetValue = mapping.map[value] ?? mapping.default

      if (targetValue !== undefined) {
        mapped[mapping.target] = targetValue
      }
      continue
    }

    if (mapping.coerce) {
      mapped[mapping.target] = coercePropValue(value, mapping.coerce)
      continue
    }

    mapped[mapping.target] = value
  }

  return mapped
}

function coercePropValue(
  value: string,
  kind: NonNullable<RendererPropMapping["coerce"]>,
) {
  if (kind === "boolean") {
    return value === "true"
  }

  if (kind === "number-array") {
    return [Number(value)]
  }

  return Number(value)
}
