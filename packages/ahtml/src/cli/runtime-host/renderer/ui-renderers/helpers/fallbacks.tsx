import React from "react"

import { resolveElement } from "../../elements"
import type {
  AgentComponentNode,
  RendererPath,
  RendererPropValue,
  RendererTextMode,
} from "../../types"
import type { UiRendererContext } from "../../ui-renderer-types"
import {
  getConfiguredPropValue,
  getStructuredItemHeading,
  getStructuredItemValue,
} from "./structured-items"
import { appendRendererPath } from "./text-and-path"

export function renderNoScriptSectionFallback({
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
  renderChildren: UiRendererContext["renderChildren"]
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

export function renderNoScriptOptionSetFallback({
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

export function renderNoScriptFieldControlFallback({
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

export function renderOptionSetItem({
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
  renderInlineChildren: UiRendererContext["renderInlineChildren"]
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
