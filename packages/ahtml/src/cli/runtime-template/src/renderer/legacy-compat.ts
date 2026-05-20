import type {
  AgentComponentNode,
  RendererLegacyStateBridge,
  RendererLegacyStructuralRoleBridge,
  RendererPropMapping,
  RendererPropValue,
  RendererSpecComponent,
} from "./types"

export function getRendererPropMappings(rendererSpec: RendererSpecComponent) {
  return [
    ...getLegacyVariantPropMappings(rendererSpec),
    ...(rendererSpec.propMappings ?? []),
  ]
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

export function resolveTabsLegacyDefaultValue({
  items,
  itemValueProp,
  node,
  rendererSpec,
}: {
  items: AgentComponentNode[]
  itemValueProp: string
  node: AgentComponentNode
  rendererSpec: RendererSpecComponent
}) {
  const bridge = getLegacyTabsDefaultBridge(rendererSpec)

  return getStructuredDefaultValue({
    explicitValue: node.props[bridge.defaultProp],
    items,
    itemValueProp,
  })
}

export function resolveAccordionLegacyState(
  node: AgentComponentNode,
  rendererSpec: RendererSpecComponent,
) {
  const bridge = getLegacyAccordionStateBridge(rendererSpec)
  const mode = resolveAccordionMode({
    explicitMode: bridge.modeProp ? node.props[bridge.modeProp] : undefined,
    fallbackMode: bridge.defaultMode,
  })
  const defaultValue = resolveAccordionDefaultValue({
    defaultPropValue: node.props[bridge.defaultProp],
    delimiter: bridge.multiValueDelimiter,
    mode,
  })

  return {
    defaultValue,
    mode,
  }
}

export function partitionTableRowsByLegacyRole(
  rows: AgentComponentNode[],
  rendererSpec: RendererSpecComponent,
) {
  const bridge = getLegacyTableRoleBridge(rendererSpec)

  return {
    headerRows: rows.filter(
      (row) => getConfiguredPropValue(row, bridge.sourceProp) === bridge.headerValue,
    ),
    bodyRows: rows.filter(
      (row) => getConfiguredPropValue(row, bridge.sourceProp) !== bridge.headerValue,
    ),
  }
}

function getLegacyVariantPropMappings(rendererSpec: RendererSpecComponent) {
  return (rendererSpec.legacyBridges?.variant ?? []).map(
    (bridge): RendererPropMapping => ({
      prop: bridge.sourceProp,
      target: bridge.targetProp,
      ...(bridge.map ? { map: bridge.map } : {}),
      ...(bridge.default !== undefined ? { default: bridge.default } : {}),
    }),
  )
}

function getLegacyTabsDefaultBridge(rendererSpec: RendererSpecComponent) {
  const bridge = rendererSpec.legacyBridges?.state?.find(
    (bridge): bridge is RendererLegacyStateBridge =>
      bridge.stateKind === "tabs-default",
  )

  if (!bridge) {
    throw new Error(
      `Renderer spec "${rendererSpec.name}" is missing legacy state bridge "tabs-default".`,
    )
  }

  return bridge
}

function getLegacyAccordionStateBridge(rendererSpec: RendererSpecComponent) {
  const bridge = rendererSpec.legacyBridges?.state?.find(
    (bridge): bridge is RendererLegacyStateBridge =>
      bridge.stateKind === "accordion-state",
  )

  if (!bridge) {
    throw new Error(
      `Renderer spec "${rendererSpec.name}" is missing legacy state bridge "accordion-state".`,
    )
  }

  return bridge
}

function getLegacyTableRoleBridge(rendererSpec: RendererSpecComponent) {
  const bridge = rendererSpec.legacyBridges?.structuralRole?.find(
    (bridge): bridge is RendererLegacyStructuralRoleBridge =>
      bridge.roleKind === "table-row-kind",
  )

  if (!bridge) {
    throw new Error(
      `Renderer spec "${rendererSpec.name}" is missing legacy structural role bridge "table-row-kind".`,
    )
  }

  return bridge
}

function getStructuredDefaultValue({
  explicitValue,
  items,
  itemValueProp,
}: {
  explicitValue?: string
  items: AgentComponentNode[]
  itemValueProp: string
}) {
  return explicitValue || getConfiguredPropValue(items[0], itemValueProp)
}

function resolveAccordionMode({
  explicitMode,
  fallbackMode,
}: {
  explicitMode?: string
  fallbackMode?: string
}) {
  return explicitMode === "single" || explicitMode === "multiple"
    ? explicitMode
    : fallbackMode === "single"
      ? "single"
      : "multiple"
}

function resolveAccordionDefaultValue({
  defaultPropValue,
  delimiter = ",",
  mode,
}: {
  defaultPropValue?: string
  delimiter?: string
  mode: "single" | "multiple"
}) {
  if (!defaultPropValue) {
    return undefined
  }

  const values = defaultPropValue
    .split(delimiter)
    .map((value) => value.trim())
    .filter(Boolean)

  if (values.length === 0) {
    return undefined
  }

  return mode === "single" ? values[0] : values
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

function getConfiguredPropValue(node: AgentComponentNode, propName: string) {
  return node.props[propName]
}
