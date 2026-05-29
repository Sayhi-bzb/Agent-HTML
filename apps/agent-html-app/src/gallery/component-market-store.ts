import { invoke, isTauri } from "@tauri-apps/api/core"

import {
  agentHtmlComponentRegistry,
  buildAgentHtmlPromptDocument,
  createEnabledComponentRegistry,
  type AgentHtmlTag,
} from "@/agent-html"
import {
  defaultEnabledGalleryComponentTags,
  normalizeEnabledGalleryComponentTags,
  type EnabledGalleryComponentTags,
} from "@/app/gallery/component-market-catalog"
import sourcePrompt from "@/agent-html/schema/prompt.md?raw"

const COMPONENT_MARKET_SETTINGS_STORAGE_KEY =
  "agent-html.component-market-settings"

export const agentHtmlPromptSchemaArtifactPath =
  ".agents/skills/agent-html/references/prompt-schema.md"

type ComponentMarketSettings = {
  enabledComponentTags: string[]
}

type AgentHtmlPromptSchemaArtifact = {
  path: string
}

export type GalleryComponentMarketStore = {
  loadEnabledComponentTags: () => Promise<Set<AgentHtmlTag>>
  saveEnabledComponentTags: (
    enabledTags: EnabledGalleryComponentTags
  ) => Promise<Set<AgentHtmlTag>>
  writePromptSchemaArtifact: (
    enabledTags: EnabledGalleryComponentTags
  ) => Promise<AgentHtmlPromptSchemaArtifact>
}

export type PromptSchemaTokenEstimate = {
  characters: number
  tokens: number
}

export type GalleryComponentPromptMetrics = {
  componentTokens: number
  current: PromptSchemaTokenEstimate
  withComponent: PromptSchemaTokenEstimate
  withoutComponent: PromptSchemaTokenEstimate
}

function createSettings(enabledTags: EnabledGalleryComponentTags) {
  return {
    enabledComponentTags: [...enabledTags].sort(),
  }
}

function parseSettings(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return null
  }

  const enabledComponentTags = (value as ComponentMarketSettings)
    .enabledComponentTags
  if (!Array.isArray(enabledComponentTags)) {
    return null
  }

  return normalizeEnabledGalleryComponentTags(
    enabledComponentTags.filter((tag): tag is string => typeof tag === "string")
  )
}

export function buildEnabledAgentHtmlPromptSchema(
  enabledTags: EnabledGalleryComponentTags
) {
  const enabledRegistry = createEnabledComponentRegistry(
    agentHtmlComponentRegistry,
    enabledTags
  )

  return `${buildAgentHtmlPromptDocument(sourcePrompt, {
    registry: enabledRegistry,
  }).trim()}\n`
}

export function estimatePromptSchemaTokens(content: string): PromptSchemaTokenEstimate {
  const normalizedContent = content.trim()

  return {
    characters: normalizedContent.length,
    tokens: normalizedContent ? Math.ceil(normalizedContent.length / 4) : 0,
  }
}

export function buildGalleryComponentPromptMetrics(
  enabledTags: EnabledGalleryComponentTags,
  componentTag: AgentHtmlTag
): GalleryComponentPromptMetrics {
  const tagsWithComponent = new Set(enabledTags)
  tagsWithComponent.add(componentTag)

  const tagsWithoutComponent = new Set(enabledTags)
  tagsWithoutComponent.delete(componentTag)

  const current = estimatePromptSchemaTokens(
    buildEnabledAgentHtmlPromptSchema(enabledTags)
  )
  const withComponent = estimatePromptSchemaTokens(
    buildEnabledAgentHtmlPromptSchema(tagsWithComponent)
  )
  const withoutComponent = estimatePromptSchemaTokens(
    buildEnabledAgentHtmlPromptSchema(tagsWithoutComponent)
  )

  return {
    componentTokens: Math.max(0, withComponent.tokens - withoutComponent.tokens),
    current,
    withComponent,
    withoutComponent,
  }
}

const browserComponentMarketStore: GalleryComponentMarketStore = {
  async loadEnabledComponentTags() {
    if (typeof localStorage === "undefined") {
      return new Set(defaultEnabledGalleryComponentTags)
    }

    const rawSettings = localStorage.getItem(COMPONENT_MARKET_SETTINGS_STORAGE_KEY)
    if (!rawSettings) {
      return new Set(defaultEnabledGalleryComponentTags)
    }

    try {
      return parseSettings(JSON.parse(rawSettings)) ?? new Set(defaultEnabledGalleryComponentTags)
    } catch {
      return new Set(defaultEnabledGalleryComponentTags)
    }
  },
  async saveEnabledComponentTags(enabledTags) {
    const normalizedTags = normalizeEnabledGalleryComponentTags(enabledTags)
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(
        COMPONENT_MARKET_SETTINGS_STORAGE_KEY,
        JSON.stringify(createSettings(normalizedTags))
      )
    }

    return normalizedTags
  },
  async writePromptSchemaArtifact(enabledTags) {
    const content = buildEnabledAgentHtmlPromptSchema(enabledTags)

    return {
      path: `browser-memory://${agentHtmlPromptSchemaArtifactPath}`,
      // Keep the content reachable in devtools without pretending browser mode
      // can write to the AgentHTML workspace internals directory.
      ...(content ? {} : {}),
    }
  },
}

const tauriComponentMarketStore: GalleryComponentMarketStore = {
  async loadEnabledComponentTags() {
    const settings = await invoke<ComponentMarketSettings | null>(
      "load_component_market_settings"
    )

    if (!settings) {
      return new Set(defaultEnabledGalleryComponentTags)
    }

    return parseSettings(settings) ?? new Set(defaultEnabledGalleryComponentTags)
  },
  async saveEnabledComponentTags(enabledTags) {
    const normalizedTags = normalizeEnabledGalleryComponentTags(enabledTags)
    const settings = await invoke<ComponentMarketSettings>(
      "save_component_market_settings",
      {
        settings: createSettings(normalizedTags),
      }
    )

    return parseSettings(settings) ?? normalizedTags
  },
  async writePromptSchemaArtifact(enabledTags) {
    return invoke<AgentHtmlPromptSchemaArtifact>(
      "write_agent_html_prompt_schema_artifact",
      {
        input: {
          content: buildEnabledAgentHtmlPromptSchema(enabledTags),
        },
      }
    )
  },
}

export function createGalleryComponentMarketStore() {
  return isTauri() ? tauriComponentMarketStore : browserComponentMarketStore
}
