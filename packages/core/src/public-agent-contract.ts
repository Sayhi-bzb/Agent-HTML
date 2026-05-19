import {
  BLOCKED_AGENT_FACING_PROP_NAMES,
  RESOLVED_STANDARD_COMPONENT_SCHEMAS,
} from "./component-schema"
import {
  DEFAULT_RENDER_CONFIG,
  PUBLIC_RENDER_CONFIG_DEFAULTS,
  PUBLIC_RENDER_CONFIG_MODEL,
  RENDER_CONFIG_KEYS,
  RENDER_CONFIG_VALUES,
} from "./render-config"
import type {
  ComponentSchema,
  PublicAgentContract,
  PublicRenderConfigContract,
  PublicSafetyPolicy,
  ResolvedComponentSchema,
} from "./types"

const safetyForbiddenCategories = [
  "Tailwind",
  "shadcn props",
  "Radix props",
  "React props",
  "events",
  "external URLs",
  "unknown tags",
  "unknown attrs",
] as const

const LEGACY_PUBLIC_PROP_REPLACEMENTS = {
  alert: {
    tone: "variant",
  },
  badge: {
    tone: "variant",
  },
} as const

export function createPublicRenderConfigContract(): PublicRenderConfigContract {
  return {
    defaults: PUBLIC_RENDER_CONFIG_DEFAULTS ?? DEFAULT_RENDER_CONFIG,
    keys: RENDER_CONFIG_KEYS,
    values: Object.fromEntries(
      RENDER_CONFIG_KEYS.map((key) => {
        const values = RENDER_CONFIG_VALUES[key]

        if (!values) {
          throw new Error(`Cannot find render config values for ${key}`)
        }

        return [key, values]
      }),
    ),
    model: PUBLIC_RENDER_CONFIG_MODEL,
  }
}

export function createPublicSafetyPolicy(): PublicSafetyPolicy {
  return {
    blockedNames: BLOCKED_AGENT_FACING_PROP_NAMES,
    forbidden: formatForbiddenPolicy(BLOCKED_AGENT_FACING_PROP_NAMES),
  }
}

export function createPublicAgentContract(): PublicAgentContract {
  const safetyPolicy = createPublicSafetyPolicy()

  return {
    components: createPublicComponentSchemas(),
    renderConfig: createPublicRenderConfigContract(),
    safetyPolicy,
    forbidden: safetyPolicy.forbidden,
  }
}

export function formatForbiddenPolicy(blockedNames: readonly string[]): string {
  return [...blockedNames, ...safetyForbiddenCategories].join("/")
}

function createPublicComponentSchemas(): readonly ComponentSchema[] {
  return RESOLVED_STANDARD_COMPONENT_SCHEMAS.map(projectPublicComponentSchema)
}

function projectPublicComponentSchema(
  schema: ResolvedComponentSchema,
): ComponentSchema {
  const replacementEntries = Object.entries(
    LEGACY_PUBLIC_PROP_REPLACEMENTS[
      schema.name as keyof typeof LEGACY_PUBLIC_PROP_REPLACEMENTS
    ] ?? {},
  )
  const exposedRawPropNames = new Set(
    schema.exposedRawProps?.map((prop) => prop.name) ?? [],
  )
  const replacedLegacyPropNames = new Set(
    replacementEntries
      .filter(([, rawPropName]) => exposedRawPropNames.has(rawPropName))
      .map(([legacyPropName]) => legacyPropName),
  )

  return {
    name: schema.name,
    description: schema.description,
    props: schema.props.filter((prop) => !replacedLegacyPropNames.has(prop.name)),
    allowedChildren: schema.allowedChildren,
  }
}
