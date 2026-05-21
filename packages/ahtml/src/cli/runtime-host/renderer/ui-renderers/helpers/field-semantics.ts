import type { RendererPath } from "../../types"
import type { FieldSemantics } from "../../ui-renderer-types"

export function createFieldSemantics({
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

export function getFieldControlProps(fieldSemantics: FieldSemantics) {
  return {
    id: fieldSemantics.controlId,
    ...getFieldLabelledByProps(fieldSemantics),
  }
}

export function getFieldLabelledByProps(fieldSemantics: FieldSemantics) {
  return {
    ...(fieldSemantics.labelId
      ? { "aria-labelledby": fieldSemantics.labelId }
      : {}),
    ...(fieldSemantics.descriptionId
      ? { "aria-describedby": fieldSemantics.descriptionId }
      : {}),
  }
}

export function getFieldLabelProps(
  fieldSemantics: FieldSemantics,
  labelableControl: boolean,
) {
  return {
    ...(fieldSemantics.labelId ? { id: fieldSemantics.labelId } : {}),
    ...(labelableControl ? { htmlFor: fieldSemantics.controlId } : {}),
  }
}

export function getFieldDescriptionProps(fieldSemantics: FieldSemantics) {
  return fieldSemantics.descriptionId
    ? { id: fieldSemantics.descriptionId }
    : {}
}

function createNodeDomId(name: string, path: RendererPath) {
  return ["ahtml", name, ...path.map(String)]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}
