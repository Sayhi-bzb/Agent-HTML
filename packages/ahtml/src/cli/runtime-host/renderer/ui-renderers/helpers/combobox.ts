import type { AgentComponentNode } from "../../types"
import type { ComboboxRendererItem } from "../../ui-renderer-types"
import {
  getStructuredItemHeading,
  getStructuredItemValue,
} from "./structured-items"
import { renderInlineTextContent } from "./text-and-path"

export function createComboboxItems(
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

export function findComboboxSelectedItem(
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
