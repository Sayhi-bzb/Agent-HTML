import type {
  RendererPropMapping,
  RendererPropValue,
  RendererSpecComponent,
} from "./types"

export function getRendererPropMappings(rendererSpec: RendererSpecComponent) {
  return rendererSpec.propMappings ?? []
}

export function applyPropMappings(
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
