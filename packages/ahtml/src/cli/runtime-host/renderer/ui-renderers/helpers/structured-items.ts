import type { AgentComponentNode, RendererSpecComponent } from "../../types"

export function getSlotChildren(
  node: AgentComponentNode,
  slotName: string | undefined,
  rendererSpecByName: Map<string, RendererSpecComponent>,
) {
  const slot = rendererSpecByName
    .get(node.name)
    ?.slots.find((item) => item.name === slotName)
  const childNames = slot?.childNames ?? [slotName]

  return node.children.filter(
    (child): child is AgentComponentNode =>
      child.type === "component" && childNames.includes(child.name),
  )
}

export function getStructuredItemsForNode(
  node: AgentComponentNode,
  itemSlot: string,
  rendererSpecByName: Map<string, RendererSpecComponent>,
) {
  return getSlotChildren(node, itemSlot, rendererSpecByName)
}

export function getStructuredItemValue(
  node: AgentComponentNode,
  itemValueProp: string,
) {
  return getConfiguredPropValue(node, itemValueProp)
}

export function getStructuredItemHeading(
  node: AgentComponentNode,
  itemHeadingProp: string,
) {
  return getConfiguredPropValue(node, itemHeadingProp)
}

export function getStructuredDefaultValue({
  items,
  itemValueProp,
}: {
  items: AgentComponentNode[]
  itemValueProp: string
}) {
  return getStructuredItemValue(items[0], itemValueProp)
}

export function getConfiguredPropValue(
  node: AgentComponentNode,
  propName: string,
) {
  return node.props[propName]
}

export function requireRendererSpecField(
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
