import React from "react"

import { resolveElement } from "../elements"
import type { RendererKind } from "../kinds"
import type {
  AgentComponentNode,
  RendererPath,
  RendererPropValue,
  RendererSpecComponent,
  RendererTextMode,
} from "../types"
import type {
  ComboboxRendererItem,
  UiRenderer,
  UiRendererContext,
} from "../ui-renderer-types"
import { createComboboxItems, findComboboxSelectedItem } from "./helpers/combobox"
import {
  createFieldSemantics,
  getFieldControlProps,
  getFieldDescriptionProps,
  getFieldLabelledByProps,
  getFieldLabelProps,
} from "./helpers/field-semantics"
import {
  renderNoScriptOptionSetFallback,
  renderOptionSetItem,
} from "./helpers/fallbacks"
import { getRendererProps } from "./helpers/shared-props"
import {
  getStructuredItemHeading,
  getStructuredItemValue,
  getStructuredItemsForNode,
  requireRendererSpecField,
} from "./helpers/structured-items"
import { appendRendererPath } from "./helpers/text-and-path"

export function createOptionUiRenderers(context: UiRendererContext) {
  function renderChoiceGroupComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const FieldContent = resolveElement("FieldContent")
    const GroupLabel = resolveElement(rendererSpec.label)
    const ItemLabel = resolveElement("FieldTitle")
    const Control = resolveElement(rendererSpec.control)
    const Item = resolveElement(rendererSpec.item)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const itemSlot = requireRendererSpecField(rendererSpec, "itemSlot")
    const itemValueProp = requireRendererSpecField(rendererSpec, "itemValueProp")
    const itemHeadingProp = requireRendererSpecField(
      rendererSpec,
      "itemHeadingProp",
    )
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const items = getStructuredItemsForNode(
      node,
      itemSlot,
      context.rendererSpecByName,
    )
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = {
      ...getRendererProps(node.props, rendererSpec),
      ...getFieldLabelledByProps(fieldSemantics),
    }

    return (
      <Root {...context.getComponentMetadataProps(node, rendererSpec, path)}>
        {label ? (
          <GroupLabel
            {...getFieldLabelProps(fieldSemantics, false)}
            className={rendererSpec.labelClassName}
          >
            {label}
          </GroupLabel>
        ) : null}
        <Control {...controlProps}>
          {items.map((item, index) => {
            const itemValue = getStructuredItemValue(item, itemValueProp)
            const itemHeading = getStructuredItemHeading(item, itemHeadingProp)
            const itemPath = appendRendererPath(path, index)
            const itemSemantics = createFieldSemantics({
              description: item.children.length > 0 ? "option-description" : undefined,
              label: itemHeading,
              name: item.name,
              path: itemPath,
            })

            return (
              <Root
                key={itemValue || itemHeading}
                data-agent-html-component={item.name}
                orientation="horizontal"
              >
                <Item
                  {...getFieldControlProps(itemSemantics)}
                  value={itemValue}
                />
                <FieldContent>
                  <ItemLabel
                    {...getFieldLabelProps(itemSemantics, false)}
                    className={rendererSpec.labelClassName}
                  >
                    {itemHeading}
                  </ItemLabel>
                  {item.children.length > 0 ? (
                    <Description
                      {...getFieldDescriptionProps(itemSemantics)}
                      className={rendererSpec.descriptionClassName}
                    >
                      {context.renderInlineChildren(item, itemPath, "prose")}
                    </Description>
                  ) : null}
                </FieldContent>
              </Root>
            )
          })}
        </Control>
        {description && Description ? (
          <Description
            {...getFieldDescriptionProps(fieldSemantics)}
            className={rendererSpec.descriptionClassName}
          >
            {description}
          </Description>
        ) : null}
      </Root>
    )
  }

  function renderChoiceInlineComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Label = resolveElement(rendererSpec.label)
    const Control = resolveElement(rendererSpec.control)
    const Item = resolveElement(rendererSpec.item)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const itemSlot = requireRendererSpecField(rendererSpec, "itemSlot")
    const itemValueProp = requireRendererSpecField(
      rendererSpec,
      "itemValueProp",
    )
    const itemHeadingProp = requireRendererSpecField(
      rendererSpec,
      "itemHeadingProp",
    )
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const items = getStructuredItemsForNode(
      node,
      itemSlot,
      context.rendererSpecByName,
    )
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = {
      ...getRendererProps(node.props, rendererSpec),
      ...getFieldLabelledByProps(fieldSemantics),
    }

    return (
      <Root {...context.getComponentMetadataProps(node, rendererSpec, path)}>
        {label ? (
          <Label
            {...getFieldLabelProps(fieldSemantics, false)}
            className={rendererSpec.labelClassName}
          >
            {label}
          </Label>
        ) : null}
        <Control {...controlProps}>
          {items.map((item, index) =>
            renderOptionSetItem({
              Item,
              item,
              itemHeadingProp,
              itemValueProp,
              path: appendRendererPath(path, index),
              renderInlineChildren: context.renderInlineChildren,
            }),
          )}
        </Control>
        {description && Description ? (
          <Description
            {...getFieldDescriptionProps(fieldSemantics)}
            className={rendererSpec.descriptionClassName}
          >
            {description}
          </Description>
        ) : null}
      </Root>
    )
  }

  function renderSelectOverlayComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Label = resolveElement(rendererSpec.label)
    const Control = resolveElement(rendererSpec.control)
    const ControlTrigger = resolveElement(rendererSpec.controlTrigger)
    const ControlValue = resolveElement(rendererSpec.controlValue)
    const ControlContent = resolveElement(rendererSpec.controlContent)
    const ItemContainer = rendererSpec.itemContainer
      ? resolveElement(rendererSpec.itemContainer)
      : undefined
    const Item = resolveElement(rendererSpec.item)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const itemSlot = requireRendererSpecField(rendererSpec, "itemSlot")
    const itemValueProp = requireRendererSpecField(
      rendererSpec,
      "itemValueProp",
    )
    const itemHeadingProp = requireRendererSpecField(
      rendererSpec,
      "itemHeadingProp",
    )
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const items = getStructuredItemsForNode(
      node,
      itemSlot,
      context.rendererSpecByName,
    )
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = getRendererProps(node.props, rendererSpec)
    const triggerProps = getFieldControlProps(fieldSemantics)
    const selectedValue = controlProps.defaultValue
    const renderedItems = renderOptionSetItems({
      Item,
      ItemContainer,
      itemHeadingProp,
      items,
      itemValueProp,
      path,
      renderInlineChildren: context.renderInlineChildren,
    })

    return (
      <>
        <Root {...context.getComponentMetadataProps(node, rendererSpec, path)}>
          {label ? (
            <Label
              {...getFieldLabelProps(fieldSemantics, false)}
              className={rendererSpec.labelClassName}
            >
              {label}
            </Label>
          ) : null}
          <Control {...controlProps}>
            <ControlTrigger {...triggerProps}>
              {rendererSpec.controlValue ? <ControlValue /> : null}
            </ControlTrigger>
            <ControlContent>{renderedItems}</ControlContent>
          </Control>
          {description && Description ? (
            <Description
              {...getFieldDescriptionProps(fieldSemantics)}
              className={rendererSpec.descriptionClassName}
            >
              {description}
            </Description>
          ) : null}
        </Root>
        {rendererSpec.fallback
          ? renderNoScriptOptionSetFallback({
              items,
              itemHeadingProp,
              itemValueProp,
              renderInlineChildren: context.renderInlineChildren,
              selectedValue,
            })
          : null}
      </>
    )
  }

  function renderComboboxInputComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Label = resolveElement(rendererSpec.label)
    const ControlRoot = resolveElement(rendererSpec.controlRoot)
    const Control = resolveElement(rendererSpec.control)
    const ControlContent = resolveElement(rendererSpec.controlContent)
    const ControlEmpty = resolveElement(rendererSpec.controlEmpty)
    const ControlList = resolveElement(rendererSpec.controlList)
    const ItemContainer = resolveElement(rendererSpec.itemContainer)
    const Item = resolveElement(rendererSpec.item)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const itemSlot = requireRendererSpecField(rendererSpec, "itemSlot")
    const itemValueProp = requireRendererSpecField(
      rendererSpec,
      "itemValueProp",
    )
    const itemHeadingProp = requireRendererSpecField(
      rendererSpec,
      "itemHeadingProp",
    )
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const items = getStructuredItemsForNode(
      node,
      itemSlot,
      context.rendererSpecByName,
    )
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const comboboxItems = createComboboxItems(items, itemValueProp, itemHeadingProp)
    const selectedItem = findComboboxSelectedItem(comboboxItems, node.props.value)
    const controlRootProps = {
      ...(rendererSpec.staticProps ?? {}),
      items: comboboxItems,
      ...(selectedItem ? { defaultValue: selectedItem } : {}),
    }
    const controlProps = getFieldControlProps(fieldSemantics)

    return (
      <>
        <Root {...context.getComponentMetadataProps(node, rendererSpec, path)}>
          {label ? (
            <Label
              {...getFieldLabelProps(fieldSemantics, false)}
              className={rendererSpec.labelClassName}
            >
              {label}
            </Label>
          ) : null}
          <ControlRoot {...controlRootProps}>
            <Control {...controlProps} />
            <ControlContent>
              {ControlEmpty && rendererSpec.emptyText ? (
                <ControlEmpty>{rendererSpec.emptyText}</ControlEmpty>
              ) : null}
              <ControlList>
                <ItemContainer>
                  {(item: ComboboxRendererItem) => (
                    <Item key={item.value} value={item}>
                      {item.label}
                      {item.description ? (
                        <>
                          {": "}
                          {item.description}
                        </>
                      ) : null}
                    </Item>
                  )}
                </ItemContainer>
              </ControlList>
            </ControlContent>
          </ControlRoot>
          {description && Description ? (
            <Description
              {...getFieldDescriptionProps(fieldSemantics)}
              className={rendererSpec.descriptionClassName}
            >
              {description}
            </Description>
          ) : null}
        </Root>
        {rendererSpec.fallback
          ? renderNoScriptOptionSetFallback({
              items,
              itemHeadingProp,
              itemValueProp,
              renderInlineChildren: context.renderInlineChildren,
              selectedValue: node.props.value,
            })
          : null}
      </>
    )
  }

  return {
    "choice-group": renderChoiceGroupComponent,
    "choice-inline": renderChoiceInlineComponent,
    "select-overlay": renderSelectOverlayComponent,
    "combobox-input": renderComboboxInputComponent,
  } satisfies Partial<Record<RendererKind, UiRenderer>>
}

function renderOptionSetItems({
  Item,
  ItemContainer,
  itemHeadingProp,
  items,
  itemValueProp,
  path,
  renderInlineChildren,
}: {
  Item: React.ElementType
  ItemContainer?: React.ElementType
  itemHeadingProp: string
  items: AgentComponentNode[]
  itemValueProp: string
  path: RendererPath
  renderInlineChildren: (
    node: AgentComponentNode,
    path: RendererPath,
    textMode?: RendererTextMode,
  ) => React.ReactNode
}) {
  const renderedItems = items.map((item, index) =>
    renderOptionSetItem({
      Item,
      item,
      itemHeadingProp,
      itemValueProp,
      path: appendRendererPath(path, index),
      renderInlineChildren,
    }),
  )

  if (ItemContainer) {
    return <ItemContainer>{renderedItems}</ItemContainer>
  }

  return renderedItems
}
