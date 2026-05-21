import React from "react"

import { resolveElement } from "../elements"
import type { RendererKind } from "../kinds"
import type {
  AgentComponentNode,
  RendererPath,
  RendererSpecComponent,
} from "../types"
import type { UiRenderer, UiRendererContext } from "../ui-renderer-types"
import { renderNoScriptSectionFallback } from "./helpers/fallbacks"
import {
  getStructuredDefaultValue,
  getStructuredItemHeading,
  getStructuredItemValue,
  getStructuredItemsForNode,
  requireRendererSpecField,
} from "./helpers/structured-items"
import { appendRendererPath } from "./helpers/text-and-path"

export function createDisclosureUiRenderers(context: UiRendererContext) {
  function renderAccordionComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Item = resolveElement(rendererSpec.item)
    const Trigger = resolveElement(rendererSpec.trigger)
    const Content = resolveElement(rendererSpec.content)
    const itemSlot = requireRendererSpecField(rendererSpec, "itemSlot")
    const itemValueProp = requireRendererSpecField(
      rendererSpec,
      "itemValueProp",
    )
    const itemHeadingProp = requireRendererSpecField(
      rendererSpec,
      "itemHeadingProp",
    )
    const items = getStructuredItemsForNode(
      node,
      itemSlot,
      context.rendererSpecByName,
    )
    const rootProps = {
      ...context.getComponentMetadataProps(node, rendererSpec, path),
      ...(rendererSpec.staticProps ?? {}),
    }

    return (
      <>
        <Root {...rootProps}>
          {items.map((item, index) => (
            <Item
              key={getStructuredItemValue(item, itemValueProp)}
              value={getStructuredItemValue(item, itemValueProp)}
            >
              <Trigger>
                {getStructuredItemHeading(item, itemHeadingProp)}
              </Trigger>
              <Content>
                {context.renderChildren(item, appendRendererPath(path, index), "prose")}
              </Content>
            </Item>
          ))}
        </Root>
        {rendererSpec.fallback
          ? renderNoScriptSectionFallback({
              itemHeadingProp,
              itemValueProp,
              items,
              path: appendRendererPath(path, "noscript"),
              renderChildren: context.renderChildren,
            })
          : null}
      </>
    )
  }

  function renderTabsComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const List = resolveElement(rendererSpec.list)
    const Trigger = resolveElement(rendererSpec.trigger)
    const Content = resolveElement(rendererSpec.content)
    const itemSlot = requireRendererSpecField(rendererSpec, "itemSlot")
    const itemValueProp = requireRendererSpecField(
      rendererSpec,
      "itemValueProp",
    )
    const itemHeadingProp = requireRendererSpecField(
      rendererSpec,
      "itemHeadingProp",
    )
    const tabs = getStructuredItemsForNode(
      node,
      itemSlot,
      context.rendererSpecByName,
    )

    if (tabs.length === 0) {
      return null
    }

    const defaultValue = getStructuredDefaultValue({
      items: tabs,
      itemValueProp,
    })

    return (
      <>
        <Root
          {...context.getComponentMetadataProps(node, rendererSpec, path)}
          defaultValue={defaultValue}
        >
          <List>
            {tabs.map((tab) => (
              <Trigger
                key={getStructuredItemValue(tab, itemValueProp)}
                value={getStructuredItemValue(tab, itemValueProp)}
              >
                {getStructuredItemHeading(tab, itemHeadingProp)}
              </Trigger>
            ))}
          </List>
          {tabs.map((tab, index) => (
            <Content
              key={getStructuredItemValue(tab, itemValueProp)}
              value={getStructuredItemValue(tab, itemValueProp)}
            >
              {context.renderChildren(tab, appendRendererPath(path, index), "prose")}
            </Content>
          ))}
        </Root>
        {rendererSpec.fallback
          ? renderNoScriptSectionFallback({
              itemHeadingProp,
              itemValueProp,
              items: tabs,
              path: appendRendererPath(path, "noscript"),
              renderChildren: context.renderChildren,
            })
          : null}
      </>
    )
  }

  return {
    accordion: renderAccordionComponent,
    tabs: renderTabsComponent,
  } satisfies Partial<Record<RendererKind, UiRenderer>>
}
