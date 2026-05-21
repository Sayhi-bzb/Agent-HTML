import React from "react"

import { resolveElement } from "../elements"
import type { RendererKind } from "../kinds"
import {
  applyPropMappings,
  getRendererPropMappings,
} from "../renderer-props"
import type {
  AgentComponentNode,
  RendererPath,
  RendererSpecComponent,
} from "../types"
import type { UiRenderer, UiRendererContext } from "../ui-renderer-types"
import {
  mergeClassNames,
} from "./helpers/text-and-path"
import { requireRendererSpecField } from "./helpers/structured-items"

function resolveCompoundContentClassName(
  rendererSpec: RendererSpecComponent,
) {
  switch (rendererSpec.contentLayout) {
    case "stack":
      return "ahtml-section-stack"
    case "prose":
      return "ahtml-prose-block"
    case "stack-prose":
      return mergeClassNames("ahtml-section-stack", "ahtml-prose-block")
    case "default":
    default:
      return undefined
  }
}

export function createBasicUiRenderers(context: UiRendererContext) {
  function renderPrimitiveComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Component = resolveElement(rendererSpec.component)
    const props = {
      ...context.getComponentMetadataProps(node, rendererSpec, path),
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
    }
    const children =
      rendererSpec.childMode === "inline"
        ? context.renderInlineChildren(node, path, rendererSpec.textMode)
        : rendererSpec.childMode === "block"
          ? context.renderChildren(node, path, rendererSpec.textMode)
          : undefined

    return <Component {...props}>{children}</Component>
  }

  function renderCompoundComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Title = resolveElement(rendererSpec.title)
    const TitleContainer = resolveElement(rendererSpec.titleContainer)
    const Content = resolveElement(rendererSpec.content)
    const props = {
      ...context.getComponentMetadataProps(node, rendererSpec, path),
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
    }
    const title = renderCompoundTitle(node, rendererSpec, Title)
    const contentClassName = resolveCompoundContentClassName(rendererSpec)
    const content =
      rendererSpec.childMode === "inline"
        ? context.renderInlineChildren(node, path, rendererSpec.textMode)
        : context.renderChildren(node, path, rendererSpec.textMode)

    return (
      <Root {...props}>
        {title && TitleContainer ? (
          <TitleContainer>{title}</TitleContainer>
        ) : (
          title
        )}
        {Content ? <Content className={contentClassName}>{content}</Content> : content}
      </Root>
    )
  }

  return {
    primitive: renderPrimitiveComponent,
    compound: renderCompoundComponent,
  } satisfies Partial<Record<RendererKind, UiRenderer>>
}

function renderCompoundTitle(
  node: AgentComponentNode,
  rendererSpec: RendererSpecComponent,
  Title: React.ElementType | undefined,
) {
  const titleProp = Title
    ? requireRendererSpecField(rendererSpec, "titleProp")
    : undefined
  const title = titleProp ? node.props[titleProp] : undefined

  if (!title || !Title) {
    return null
  }

  return <Title className={rendererSpec.titleClassName}>{title}</Title>
}
