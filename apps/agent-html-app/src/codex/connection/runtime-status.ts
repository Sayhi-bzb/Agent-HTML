import { countItems, readEffectiveConfig, readRuntimeItems } from "./parsers"
import type {
  CodexRuntimeReadSpec,
  CodexRuntimeStatus,
} from "./types"

export const CODEX_RUNTIME_READS: CodexRuntimeReadSpec[] = [
  {
    capability: "config",
    method: "config/read",
    params: () => ({}),
  },
  {
    capability: "models",
    method: "model/list",
    params: () => ({ includeHidden: false }),
  },
  {
    capability: "collaborationModes",
    method: "collaborationMode/list",
    params: () => ({}),
  },
  {
    capability: "skills",
    method: "skills/list",
    params: ({ cwd }) => ({
      cwds: cwd ? [cwd] : [],
      forceReload: true,
    }),
  },
  {
    capability: "plugins",
    method: "plugin/list",
    params: () => ({ limit: 100 }),
  },
  {
    capability: "apps",
    method: "app/list",
    params: () => ({ limit: 100 }),
  },
  {
    capability: "mcpServers",
    method: "mcpServerStatus/list",
    params: () => ({ detail: "toolsAndAuthOnly", limit: 100 }),
  },
]

export function createIdleRuntimeStatus(): CodexRuntimeStatus {
  return {
    capabilities: {
      apps: { ok: false },
      collaborationModes: { ok: false },
      config: { ok: false },
      mcpServers: { ok: false },
      models: { ok: false },
      plugins: { ok: false },
      skills: { ok: false },
    },
    config: {},
    error: null,
    status: "idle",
  }
}

export function createRuntimeStatusFromEntries(
  entries: Array<{
    capability: CodexRuntimeReadSpec["capability"]
    result: unknown
    status: {
      count?: number
      error?: string
      ok: boolean
    }
  }>
): CodexRuntimeStatus {
  const capabilities = createIdleRuntimeStatus().capabilities
  let config: CodexRuntimeStatus["config"] = {}
  for (const entry of entries) {
    capabilities[entry.capability] = {
      ...entry.status,
      items: entry.status.ok ? readRuntimeItems(entry.result) : undefined,
    }
    if (entry.capability === "config" && entry.status.ok) {
      config = readEffectiveConfig(entry.result)
    }
  }

  const hasSuccess = entries.some((entry) => entry.status.ok)
  const hasFailure = entries.some((entry) => !entry.status.ok)
  return {
    capabilities,
    config,
    error: hasSuccess || !hasFailure ? null : "Unable to read Codex status.",
    loadedAt: new Date().toISOString(),
    status: hasSuccess ? "ready" : "error",
  }
}

export { countItems }
