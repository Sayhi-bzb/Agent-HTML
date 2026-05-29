import * as React from "react"
import { RotateCwIcon, SaveIcon } from "lucide-react"

import { useCodexConnection } from "@/app/codex/connection"
import type {
  CodexRuntimeCapabilityStatus,
  CodexRuntimeStatus,
} from "@/app/codex/connection"
import { Button } from "@/app/shared/ui/button"
import {
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@/app/shared/ui/popover"
import { Textarea } from "@/app/shared/ui/textarea"
import { SettingsInfoPanel } from "@/app/shell/settings-surface"
import { createWorkspaceStore } from "@/app/workspace/store"

const workspaceStore = createWorkspaceStore()

const settingsViews = [
  "Instructions",
  "Skills",
  "MCP",
  "Plugins",
  "Runtime",
] as const

type SettingsView = (typeof settingsViews)[number]

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Unable to update AGENTS.md."
}

function formatCapability(
  capability: CodexRuntimeCapabilityStatus,
  runtimeStatus: CodexRuntimeStatus["status"]
) {
  if (runtimeStatus === "idle") {
    return "Not loaded"
  }

  if (runtimeStatus === "loading") {
    return "Loading..."
  }

  if (!capability.ok) {
    return capability.error ?? "Unavailable"
  }

  return typeof capability.count === "number"
    ? `${capability.count} available`
    : "Available"
}

function CapabilityRow({
  label,
  runtimeStatus,
  status,
}: {
  label: string
  runtimeStatus: CodexRuntimeStatus["status"]
  status: CodexRuntimeCapabilityStatus
}) {
  const isUnavailable = runtimeStatus === "error" && !status.ok

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
      <span className="font-medium" data-selection="none">
        {label}
      </span>
      <span
        className={isUnavailable ? "text-destructive" : "text-muted-foreground"}
        data-cursor={isUnavailable ? "text" : undefined}
        data-selection={isUnavailable ? "text" : "none"}
      >
        {formatCapability(status, runtimeStatus)}
      </span>
    </div>
  )
}

function PathInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
      <span data-selection="none" className="text-muted-foreground">
        {label}
      </span>
      <span data-cursor="text" data-selection="text" className="break-all">
        {value}
      </span>
    </div>
  )
}

export function PetSettingsContent() {
  const codexConnection = useCodexConnection()
  const runtimeStatus = codexConnection.runtimeStatus
  const [activeView, setActiveView] =
    React.useState<SettingsView>("Instructions")
  const [baseline, setBaseline] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "saved">("idle")

  const isDirty = draft !== baseline

  const readInstructions = React.useCallback(() => {
    return workspaceStore
      .getRootAgentsInstructions()
      .then((source) => {
        setBaseline(source)
        setDraft(source)
        setStatus("idle")
      })
      .catch((loadError: unknown) => {
        setError(getErrorMessage(loadError))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const loadInstructions = React.useCallback(() => {
    setError(null)
    setIsLoading(true)
    return readInstructions()
  }, [readInstructions])

  React.useEffect(() => {
    void readInstructions()
  }, [readInstructions])

  const saveInstructions = React.useCallback(() => {
    setError(null)
    setIsSaving(true)
    workspaceStore
      .updateRootAgentsInstructions({ source: draft })
      .then((source) => {
        setBaseline(source)
        setDraft(source)
        setStatus("saved")
      })
      .catch((saveError: unknown) => {
        setError(getErrorMessage(saveError))
      })
      .finally(() => {
        setIsSaving(false)
      })
  }, [draft])

  const refreshRuntimeStatus = React.useCallback(() => {
    void codexConnection.refreshRuntimeStatus()
  }, [codexConnection])
  const isRuntimeRefreshDisabled =
    codexConnection.status !== "connected" || runtimeStatus.status === "loading"

  return (
    <div className="flex flex-col gap-3" data-pet-settings-no-drag="">
      <div className="flex items-start justify-between gap-3">
        <PopoverHeader className="min-w-0 flex-1" data-selection="none">
          <PopoverTitle>AgentHTML settings</PopoverTitle>
          <PopoverDescription>
            Review the workspace files and Codex app-server surfaces this pet can
            reach.
          </PopoverDescription>
        </PopoverHeader>
        <Button
          disabled={isRuntimeRefreshDisabled}
          onClick={refreshRuntimeStatus}
          size="sm"
          type="button"
          variant="outline"
        >
          <RotateCwIcon aria-hidden="true" className="size-3.5" />
          {runtimeStatus.status === "loading" ? "Loading" : "Refresh"}
        </Button>
      </div>
      <div
        aria-label="AgentHTML settings views"
        className="grid grid-cols-5 gap-1 rounded-lg border border-border/60 bg-muted/20 p-1"
        data-selection="none"
        role="tablist"
      >
        {settingsViews.map((view) => (
          <button
            aria-selected={activeView === view}
            className={[
              "rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors",
              "hover:bg-background hover:text-foreground",
              activeView === view
                ? "bg-background text-foreground shadow-sm"
                : null,
            ]
              .filter(Boolean)
              .join(" ")}
            key={view}
            onClick={() => setActiveView(view)}
            role="tab"
            type="button"
          >
            {view}
          </button>
        ))}
      </div>
      {activeView === "Instructions" ? (
        <InstructionsView
          draft={draft}
          error={error}
          isDirty={isDirty}
          isLoading={isLoading}
          isSaving={isSaving}
          loadInstructions={loadInstructions}
          saveInstructions={saveInstructions}
          setDraft={setDraft}
          setStatus={setStatus}
          status={status}
        />
      ) : null}
      {activeView === "Skills" ? (
        <SkillsView runtimeStatus={runtimeStatus} />
      ) : null}
      {activeView === "MCP" ? (
        <McpView runtimeStatus={runtimeStatus} />
      ) : null}
      {activeView === "Plugins" ? (
        <PluginsView runtimeStatus={runtimeStatus} />
      ) : null}
      {activeView === "Runtime" ? (
        <RuntimeView
          codexCommand={codexConnection.health?.codexCommand ?? "unknown"}
          connectionStatus={codexConnection.status}
          cwd={codexConnection.health?.cwd ?? "unknown"}
          runtimeStatus={runtimeStatus}
        />
      ) : null}
    </div>
  )
}

function InstructionsView({
  draft,
  error,
  isDirty,
  isLoading,
  isSaving,
  loadInstructions,
  saveInstructions,
  setDraft,
  setStatus,
  status,
}: {
  draft: string
  error: string | null
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  loadInstructions: () => Promise<void>
  saveInstructions: () => void
  setDraft: (draft: string) => void
  setStatus: (status: "idle" | "saved") => void
  status: "idle" | "saved"
}) {
  return (
    <>
      <PathInfoRow label="File" value="AgentHTML/AGENTS.md" />
      <div className="flex min-h-0 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-xs font-medium text-muted-foreground"
            data-selection="none"
            htmlFor="pet-agent-instructions"
          >
            Project instructions
          </label>
          <span
            className="text-xs text-muted-foreground"
            data-selection="none"
          >
            {isDirty ? "Unsaved changes" : "Current"}
          </span>
        </div>
        <Textarea
          aria-label="AgentHTML AGENTS.md content"
          className="h-72 min-h-0 resize-none overflow-auto font-mono text-xs leading-relaxed"
          disabled={isLoading || isSaving}
          id="pet-agent-instructions"
          onChange={(event) => {
            setDraft(event.target.value)
            setStatus("idle")
          }}
          placeholder="Loading AGENTS.md..."
          spellCheck={false}
          value={isLoading ? "" : draft}
        />
      </div>
      {error ? (
        <SettingsInfoPanel variant="destructive">{error}</SettingsInfoPanel>
      ) : null}
      {!error && status === "saved" ? (
        <SettingsInfoPanel>Saved to AgentHTML/AGENTS.md.</SettingsInfoPanel>
      ) : null}
      <div
        className="flex items-center justify-end gap-2"
        data-selection="none"
      >
        <Button
          disabled={isLoading || isSaving}
          onClick={loadInstructions}
          size="sm"
          type="button"
          variant="outline"
        >
          <RotateCwIcon aria-hidden="true" className="size-3.5" />
          Reload
        </Button>
        <Button
          disabled={isLoading || isSaving || !isDirty}
          onClick={saveInstructions}
          size="sm"
          type="button"
        >
          <SaveIcon aria-hidden="true" className="size-3.5" />
          {isSaving ? "Saving" : "Save"}
        </Button>
      </div>
    </>
  )
}

function SkillsView({
  runtimeStatus,
}: {
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <CapabilityRow
        label="Codex skills"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.skills}
      />
      <PathInfoRow
        label="Managed skill"
        value="AgentHTML/.agents/skills/agent-html/SKILL.md"
      />
      <PathInfoRow
        label="Schema reference"
        value="AgentHTML/.agents/skills/agent-html/references/prompt-schema.md"
      />
      <SettingsInfoPanel>
        AgentHTML writes the managed `agent-html` skill for artifact work. Users
        can add additional workspace skills under `.agents/skills/`; Codex owns
        skill discovery and execution through the app-server.
      </SettingsInfoPanel>
    </div>
  )
}

function McpView({
  runtimeStatus,
}: {
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <CapabilityRow
        label="MCP servers"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.mcpServers}
      />
      <PathInfoRow label="Codex config" value="~/.codex/config.toml" />
      <SettingsInfoPanel>
        MCP servers are managed by Codex config, including `[mcp_servers.*]`
        entries and tool controls. AgentHTML reads `mcpServerStatus/list` from
        the Codex app-server and does not edit MCP auth or server config here.
      </SettingsInfoPanel>
    </div>
  )
}

function PluginsView({
  runtimeStatus,
}: {
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <CapabilityRow
        label="Codex plugins"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.plugins}
      />
      <CapabilityRow
        label="Codex apps"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.apps}
      />
      <PathInfoRow label="Workspace plugins" value="AgentHTML/plugins/" />
      <SettingsInfoPanel>
        Local plugin packages may live under `plugins/`, but plugin listing,
        app listing, install state, and execution semantics belong to Codex.
        This card only mirrors app-server availability.
      </SettingsInfoPanel>
    </div>
  )
}

function RuntimeView({
  codexCommand,
  connectionStatus,
  cwd,
  runtimeStatus,
}: {
  codexCommand: string
  connectionStatus: string
  cwd: string
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <CapabilityRow
        label="Runtime config"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.config}
      />
      <div className="grid gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs">
        <RuntimeField label="Connection" value={connectionStatus} />
        <RuntimeField label="Command" value={codexCommand} />
        <RuntimeField label="Cwd" value={cwd} />
        <RuntimeField label="Model" value={runtimeStatus.config.model ?? "unknown"} />
        <RuntimeField
          label="Provider"
          value={runtimeStatus.config.modelProvider ?? "unknown"}
        />
        <RuntimeField
          label="Sandbox"
          value={runtimeStatus.config.sandboxMode ?? "unknown"}
        />
        <RuntimeField
          label="Approvals"
          value={runtimeStatus.config.approvalPolicy ?? "unknown"}
        />
      </div>
      <SettingsInfoPanel>
        Runtime values are read from the Codex app-server with `config/read` and
        related status APIs. AgentHTML starts Codex in the AgentHTML workspace
        root and does not duplicate Codex model, sandbox, or approval ownership.
      </SettingsInfoPanel>
    </div>
  )
}

function RuntimeField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] gap-3">
      <span data-selection="none" className="text-muted-foreground">
        {label}
      </span>
      <span data-cursor="text" data-selection="text" className="break-all">
        {value}
      </span>
    </div>
  )
}
