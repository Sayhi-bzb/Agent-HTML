import {
  applyPropMappings,
  getRendererPropMappings,
} from "../../renderer-props"
import type { RendererSpecComponent } from "../../types"

export function getRendererProps(
  props: Record<string, string>,
  rendererSpec: RendererSpecComponent,
) {
  return {
    ...(rendererSpec.staticProps ?? {}),
    ...applyPropMappings(props, getRendererPropMappings(rendererSpec)),
  }
}

export function resolveMappedProp(
  value: string | undefined,
  map: Record<string, string>,
  defaultValue: string,
) {
  if (!value) {
    return defaultValue
  }

  return map[value] ?? defaultValue
}
