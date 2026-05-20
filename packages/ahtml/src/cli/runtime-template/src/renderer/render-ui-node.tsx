import React from "react"

import { resolveElement } from "./elements"
import type { RendererKind } from "./kinds"
import {
  applyPropMappings,
  getRendererPropMappings,
} from "./renderer-props"
import type {
  AgentComponentNode,
  AgentNode,
  RendererPath,
  RendererPathSegment,
  RendererSpecComponent,
  RendererTextMode,
} from "./types"

type UiRendererContext = {
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
  rendererSpecByName: Map<string, RendererSpecComponent>
}

type UiRenderer = (
  node: AgentComponentNode,
  rendererSpec: RendererSpecComponent,
  path: RendererPath,
) => React.ReactNode

type FieldSemantics = {
  controlId: string
  labelId?: string
  descriptionId?: string
}

type ComboboxRendererItem = {
  value: string
  label: string
  description?: string
}

export function createUiRenderer(context: UiRendererContext) {
  function renderPrimitiveComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Component = resolveElement(rendererSpec.component)
    const props = {
      ...context.getComponentMetadataProps(node, rendererSpec),
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
      ...context.getComponentMetadataProps(node, rendererSpec),
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
    }
    const title = renderCompoundTitle(node, rendererSpec, Title)
    const contentClassName = mergeClassNames(
      "ahtml-section-stack",
      rendererSpec.childMode === "block" ? "ahtml-prose-block" : undefined,
    )
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

  function renderTextFieldComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Label = resolveElement(rendererSpec.label)
    const Control = resolveElement(rendererSpec.control)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const valueProp = rendererSpec.fallback
      ? requireRendererSpecField(rendererSpec, "valueProp")
      : undefined
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = {
      ...rendererSpec.staticProps,
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
      ...getFieldControlProps(fieldSemantics),
    }

    return (
      <>
        <Root {...context.getComponentMetadataProps(node, rendererSpec)}>
          {label ? (
            <Label
              {...getFieldLabelProps(fieldSemantics, true)}
              className={rendererSpec.labelClassName}
            >
              {label}
            </Label>
          ) : null}
          <Control {...controlProps} />
          {description && Description ? (
            <Description
              {...getFieldDescriptionProps(fieldSemantics)}
              className={rendererSpec.descriptionClassName}
            >
              {description}
            </Description>
          ) : null}
        </Root>
        {rendererSpec.fallback && valueProp
          ? renderNoScriptFieldControlFallback({
              description,
              label,
              value: node.props[valueProp],
            })
          : null}
      </>
    )
  }

  function renderToggleFieldComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const FieldContent = resolveElement("FieldContent")
    const Label = resolveElement(rendererSpec.label)
    const Control = resolveElement(rendererSpec.control)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = {
      ...rendererSpec.staticProps,
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
      ...getFieldControlProps(fieldSemantics),
    }

    return (
      <Root
        {...context.getComponentMetadataProps(node, rendererSpec)}
        orientation="horizontal"
      >
        <Control {...controlProps} />
        <FieldContent>
          {label ? (
            <Label
              {...getFieldLabelProps(fieldSemantics, true)}
              className={rendererSpec.labelClassName}
            >
              {label}
            </Label>
          ) : null}
          {description && Description ? (
            <Description
              {...getFieldDescriptionProps(fieldSemantics)}
              className={rendererSpec.descriptionClassName}
            >
              {description}
            </Description>
          ) : null}
        </FieldContent>
      </Root>
    )
  }

  function renderRangeFieldComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    return renderTextFieldComponent(node, rendererSpec, path)
  }

  function renderSliderFieldComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Label = resolveElement(rendererSpec.label)
    const Control = resolveElement(rendererSpec.control)
    const Description = resolveElement(rendererSpec.description)
    const labelProp = requireRendererSpecField(rendererSpec, "labelProp")
    const valueProp = requireRendererSpecField(rendererSpec, "valueProp")
    const descriptionProp = rendererSpec.description
      ? requireRendererSpecField(rendererSpec, "descriptionProp")
      : undefined
    const label = node.props[labelProp]
    const description = descriptionProp
      ? node.props[descriptionProp]
      : undefined
    const fieldSemantics = createFieldSemantics({
      description,
      label,
      name: node.name,
      path,
    })
    const controlProps = {
      ...rendererSpec.staticProps,
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
      controlId: fieldSemantics.controlId,
      labelId: fieldSemantics.labelId,
      descriptionId: fieldSemantics.descriptionId,
    }

    return (
      <>
        <Root {...context.getComponentMetadataProps(node, rendererSpec)}>
          {label ? (
            <Label
              {...getFieldLabelProps(fieldSemantics, false)}
              className={rendererSpec.labelClassName}
            >
              {label}
            </Label>
          ) : null}
          <Control {...controlProps} />
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
          ? renderNoScriptFieldControlFallback({
              description,
              label,
              value: node.props[valueProp],
            })
          : null}
      </>
    )
  }

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
    const items = getStructuredItemsForNode(node, itemSlot)
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
      <Root {...context.getComponentMetadataProps(node, rendererSpec)}>
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
    const items = getStructuredItemsForNode(node, itemSlot)
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
      <Root {...context.getComponentMetadataProps(node, rendererSpec)}>
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
    const items = getStructuredItemsForNode(node, itemSlot)
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
        <Root {...context.getComponentMetadataProps(node, rendererSpec)}>
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
    const items = getStructuredItemsForNode(node, itemSlot)
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
        <Root {...context.getComponentMetadataProps(node, rendererSpec)}>
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

  function renderCollectionComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(
      rendererSpec.rootByProp
        ? resolveMappedProp(
            node.props[rendererSpec.rootByProp.prop],
            rendererSpec.rootByProp.map,
            rendererSpec.rootByProp.default,
          )
        : rendererSpec.root,
    )
    const Item = resolveElement(rendererSpec.item)
    const rootProps = {
      ...context.getComponentMetadataProps(node, rendererSpec),
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
    }

    return (
      <Root {...rootProps}>
        {getSlotChildren(node, rendererSpec.itemSlot).map((item, index) => (
          <Item key={index}>
            {rendererSpec.childMode === "inline"
              ? context.renderInlineChildren(
                  item,
                  appendRendererPath(path, index),
                  rendererSpec.textMode,
                )
              : context.renderChildren(
                  item,
                  appendRendererPath(path, index),
                  rendererSpec.textMode,
                )}
          </Item>
        ))}
      </Root>
    )
  }

  function renderTableComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Header = resolveElement(rendererSpec.header)
    const Body = resolveElement(rendererSpec.body)
    const rowSlot = requireRendererSpecField(rendererSpec, "rowSlot")
    const cellSlot = requireRendererSpecField(rendererSpec, "cellSlot")
    const rows = getSlotChildren(node, rowSlot)
    const headerRows = rows.length > 1 ? rows.slice(0, 1) : []
    const bodyRows = rows.length > 1 ? rows.slice(1) : rows

    return (
      <Root {...context.getComponentMetadataProps(node, rendererSpec)}>
        {headerRows.length > 0 ? (
          <Header>
            {headerRows.map((row, index) =>
              renderTableRow(
                row,
                index,
                rendererSpec,
                cellSlot,
                true,
                appendRendererPath(path, "header", index),
              ),
            )}
          </Header>
        ) : null}
        <Body>
          {bodyRows.map((row, index) =>
            renderTableRow(
              row,
              index,
              rendererSpec,
              cellSlot,
              false,
              appendRendererPath(path, "body", index),
            ),
          )}
        </Body>
      </Root>
    )
  }

  function renderTableRow(
    row: AgentComponentNode,
    index: number,
    rendererSpec: RendererSpecComponent,
    cellSlot: string,
    isHeader: boolean,
    path: RendererPath,
  ) {
    const Row = resolveElement(rendererSpec.row)
    const Cell = resolveElement(
      isHeader ? rendererSpec.headerCell : rendererSpec.bodyCell,
    )

    return (
      <Row key={index} data-agent-html-component={row.name}>
        {getSlotChildren(row, cellSlot).map((cell, cellIndex) => (
          <Cell key={cellIndex} data-agent-html-component={cell.name}>
            {context.renderInlineChildren(
              cell,
              appendRendererPath(path, cellIndex),
              "prose",
            )}
          </Cell>
        ))}
      </Row>
    )
  }

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
    const items = getStructuredItemsForNode(node, itemSlot)
    const rootProps = {
      ...context.getComponentMetadataProps(node, rendererSpec),
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
    const tabs = getStructuredItemsForNode(node, itemSlot)

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
          {...context.getComponentMetadataProps(node, rendererSpec)}
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

  function getSlotChildren(
    node: AgentComponentNode,
    slotName: string | undefined,
  ) {
    const slot = context.rendererSpecByName
      .get(node.name)
      ?.slots.find((item) => item.name === slotName)
    const childNames = slot?.childNames ?? [slotName]

    return node.children.filter(
      (child): child is AgentComponentNode =>
        child.type === "component" && childNames.includes(child.name),
    )
  }

  function getStructuredItemsForNode(
    node: AgentComponentNode,
    itemSlot: string,
  ) {
    return getSlotChildren(node, itemSlot)
  }

  return {
    primitive: renderPrimitiveComponent,
    compound: renderCompoundComponent,
    "text-field": renderTextFieldComponent,
    "toggle-field": renderToggleFieldComponent,
    "range-field": renderRangeFieldComponent,
    "slider-field": renderSliderFieldComponent,
    "choice-group": renderChoiceGroupComponent,
    "choice-inline": renderChoiceInlineComponent,
    "select-overlay": renderSelectOverlayComponent,
    "combobox-input": renderComboboxInputComponent,
    collection: renderCollectionComponent,
    table: renderTableComponent,
    accordion: renderAccordionComponent,
    tabs: renderTabsComponent,
  } satisfies Partial<Record<RendererKind, UiRenderer>>
}

function renderNoScriptSectionFallback({
  items,
  itemValueProp,
  itemHeadingProp,
  path,
  renderChildren,
}: {
  items: AgentComponentNode[]
  itemValueProp: string
  itemHeadingProp: string
  path: RendererPath
  renderChildren: (
    node: AgentComponentNode,
    path: RendererPath,
    textMode?: RendererTextMode,
  ) => React.ReactNode
}) {
  return (
    <noscript>
      <section className="grid gap-3">
        {items.map((item, index) => (
          <section
            className="grid gap-3"
            key={getConfiguredPropValue(item, itemValueProp)}
          >
            <h2 className="m-0 text-lg font-medium leading-7">
              {getConfiguredPropValue(item, itemHeadingProp)}
            </h2>
            {renderChildren(item, appendRendererPath(path, index), "prose")}
          </section>
        ))}
      </section>
    </noscript>
  )
}

function renderNoScriptOptionSetFallback({
  items,
  itemHeadingProp,
  itemValueProp,
  renderInlineChildren,
  selectedValue,
}: {
  items: AgentComponentNode[]
  itemHeadingProp: string
  itemValueProp: string
  renderInlineChildren: (
    node: AgentComponentNode,
    path: RendererPath,
    textMode?: RendererTextMode,
  ) => React.ReactNode
  selectedValue?: RendererPropValue
}) {
  const Field = resolveElement("Field")
  const Label = resolveElement("FieldLabel")
  const Description = resolveElement("FieldDescription")

  return (
    <noscript>
      <section className="grid gap-3">
        {items.map((item) => {
          const itemValue = getConfiguredPropValue(item, itemValueProp)
          const itemHeading = getConfiguredPropValue(item, itemHeadingProp)
          const selected = selectedValue === itemValue

          return (
            <Field key={itemValue || itemHeading}>
              <Label>
                {itemHeading}
                {selected ? " (selected)" : ""}
              </Label>
              {item.children.length > 0 ? (
                <Description>{renderInlineChildren(item, ["noscript"], "prose")}</Description>
              ) : null}
            </Field>
          )
        })}
      </section>
    </noscript>
  )
}

function renderOptionSetItem({
  Item,
  item,
  itemHeadingProp,
  itemValueProp,
  path,
  renderInlineChildren,
}: {
  Item: React.ElementType
  item: AgentComponentNode
  itemHeadingProp: string
  itemValueProp: string
  path: RendererPath
  renderInlineChildren: (
    node: AgentComponentNode,
    path: RendererPath,
    textMode?: RendererTextMode,
  ) => React.ReactNode
}) {
  const itemValue = getStructuredItemValue(item, itemValueProp)
  const itemHeading = getStructuredItemHeading(item, itemHeadingProp)

  return (
    <Item key={itemValue || itemHeading} value={itemValue}>
      {itemHeading}
      {item.children.length > 0 ? (
        <>
          {": "}
          {renderInlineChildren(item, path, "prose")}
        </>
      ) : null}
    </Item>
  )
}

function renderNoScriptFieldControlFallback({
  description,
  label,
  value,
}: {
  description?: string
  label?: string
  value?: string
}) {
  const Field = resolveElement("Field")
  const Label = resolveElement("FieldLabel")
  const Description = resolveElement("FieldDescription")

  return (
    <noscript>
      <Field>
        {label ? <Label>{label}</Label> : null}
        {typeof value === "string" && value.length > 0 ? (
          <Description>{value}</Description>
        ) : null}
        {description ? <Description>{description}</Description> : null}
      </Field>
    </noscript>
  )
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

function renderInlineChildren(
  node: AgentComponentNode,
  path: RendererPath,
  textMode: RendererTextMode = "prose",
) {
  return node.children.map((child, index) => {
    if (child.type === "text") {
      return (
        <React.Fragment key={index}>
          {textMode === "preformatted"
            ? child.value
            : collapseTextNodeWhitespace(child.value)}
        </React.Fragment>
      )
    }

    return (
      <React.Fragment key={index}>
        {renderInlineTextContent([child])}
      </React.Fragment>
    )
  })
}

function mergeClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ") || undefined
}

function collapseTextNodeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function appendRendererPath(
  path: RendererPath,
  ...segments: RendererPathSegment[]
) {
  return [...path, ...segments]
}

function createNodeDomId(name: string, path: RendererPath) {
  return ["ahtml", name, ...path.map(String)]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function createFieldSemantics({
  description,
  label,
  name,
  path,
}: {
  description?: string
  label?: string
  name: string
  path: RendererPath
}) {
  const fieldId = createNodeDomId(name, path)

  return {
    controlId: `${fieldId}-control`,
    ...(label ? { labelId: `${fieldId}-label` } : {}),
    ...(description ? { descriptionId: `${fieldId}-description` } : {}),
  } satisfies FieldSemantics
}

function getFieldControlProps(fieldSemantics: FieldSemantics) {
  return {
    id: fieldSemantics.controlId,
    ...getFieldLabelledByProps(fieldSemantics),
  }
}

function getFieldLabelledByProps(fieldSemantics: FieldSemantics) {
  return {
    ...(fieldSemantics.labelId
      ? { "aria-labelledby": fieldSemantics.labelId }
      : {}),
    ...(fieldSemantics.descriptionId
      ? { "aria-describedby": fieldSemantics.descriptionId }
      : {}),
  }
}

function getFieldLabelProps(
  fieldSemantics: FieldSemantics,
  labelableControl: boolean,
) {
  return {
    ...(fieldSemantics.labelId ? { id: fieldSemantics.labelId } : {}),
    ...(labelableControl ? { htmlFor: fieldSemantics.controlId } : {}),
  }
}

function getFieldDescriptionProps(fieldSemantics: FieldSemantics) {
  return fieldSemantics.descriptionId
    ? { id: fieldSemantics.descriptionId }
    : {}
}

function createComboboxItems(
  items: AgentComponentNode[],
  itemValueProp: string,
  itemHeadingProp: string,
) {
  return items.map((item) => ({
    value: getStructuredItemValue(item, itemValueProp),
    label: getStructuredItemHeading(item, itemHeadingProp),
    ...(item.children.length > 0
      ? { description: renderInlineTextContent(item.children) }
      : {}),
  }))
}

function findComboboxSelectedItem(
  items: ComboboxRendererItem[],
  value: string | undefined,
) {
  if (!value) {
    return undefined
  }

  return items.find((item) => item.value === value) ?? {
    value,
    label: value,
  }
}

function renderInlineTextContent(children: AgentNode[]) {
  return children
    .map((child) => (child.type === "text" ? child.value : ""))
    .join("")
}

function getStructuredItemValue(
  node: AgentComponentNode,
  itemValueProp: string,
) {
  return getConfiguredPropValue(node, itemValueProp)
}

function getStructuredItemHeading(
  node: AgentComponentNode,
  itemHeadingProp: string,
) {
  return getConfiguredPropValue(node, itemHeadingProp)
}

function getStructuredDefaultValue({
  items,
  itemValueProp,
}: {
  items: AgentComponentNode[]
  itemValueProp: string
}) {
  return getStructuredItemValue(items[0], itemValueProp)
}

function getRendererProps(
  props: Record<string, string>,
  rendererSpec: RendererSpecComponent,
) {
  return {
    ...(rendererSpec.staticProps ?? {}),
    ...applyPropMappings(props, getRendererPropMappings(rendererSpec)),
  }
}

function resolveMappedProp(
  value: string | undefined,
  map: Record<string, string>,
  defaultValue: string,
) {
  if (!value) {
    return defaultValue
  }

  return map[value] ?? defaultValue
}

function getConfiguredPropValue(node: AgentComponentNode, propName: string) {
  return node.props[propName]
}

function requireRendererSpecField(
  rendererSpec: RendererSpecComponent,
  fieldName: keyof RendererSpecComponent,
) {
  const value = rendererSpec[fieldName]

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Renderer spec "${rendererSpec.name}" is missing required field "${String(fieldName)}".`,
    )
  }

  return value
}
