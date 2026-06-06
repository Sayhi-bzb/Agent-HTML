import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import { deriveDefaultAttrs } from "@/agent-html/schema/derive"

export const defaultAttrs = deriveDefaultAttrs(agentHtmlComponentRegistry)

export const layoutDefaultGapClass = "gap-4"

export const clusterDefaults = {
  justify: defaultAttrs.Cluster?.justify ?? "start",
  wrap: defaultAttrs.Cluster?.wrap ?? "true",
} as const

export const gridDefaults = {
  columns: defaultAttrs.Grid?.columns ?? "2",
} as const

export const sectionDefaults = {
  width: defaultAttrs.Section?.width ?? "content",
} as const

export const timelineItemDefaults = {
  status: defaultAttrs.TimelineItem?.status ?? "default",
} as const
