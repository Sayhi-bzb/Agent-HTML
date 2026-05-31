import * as React from "react"
import { RotateCwIcon, SaveIcon, SettingsIcon, XIcon } from "lucide-react"

import { useCodexConnection } from "@/app/codex/connection"
import type {
  CodexRuntimeCapabilityStatus,
  CodexRuntimeStatus,
} from "@/app/codex/connection"
import type { CodexRuntimeCapabilityItem } from "@/app/codex/connection/types"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import { Input } from "@/app/shared/ui/input"
import { Label } from "@/app/shared/ui/label"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import { Separator } from "@/app/shared/ui/separator"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarStateProvider,
} from "@/app/shared/ui/sidebar"
import { Textarea } from "@/app/shared/ui/textarea"
import { SettingsInfoPanel } from "@/app/shell/settings-surface"
import { createWorkspaceStore } from "@/app/workspace/store"

const workspaceStore = createWorkspaceStore()

const settingsViews = [
  "AGENTS.md",
  "MCP",
  "Skills",
  "Plugins",
  "Runtime",
  "Connection",
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

function CapabilityItemList({
  emptyLabel = "No items reported",
  items,
  runtimeStatus,
}: {
  emptyLabel?: string
  items?: CodexRuntimeCapabilityItem[]
  runtimeStatus: CodexRuntimeStatus["status"]
}) {
  if (runtimeStatus === "idle" || runtimeStatus === "loading") {
    return null
  }

  if (!items?.length) {
    return (
      <div
        className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground"
        data-selection="none"
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="grid max-h-40 gap-1.5 overflow-auto rounded-lg border border-border/60 bg-background/60 p-2">
      {items.map((item) => (
        <div
          className="grid min-w-0 gap-1 rounded-md bg-muted/30 px-2.5 py-1.5 text-xs"
          key={`${item.id ?? item.name}:${item.source ?? ""}:${item.status ?? ""}`}
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span
              className="min-w-0 truncate font-medium"
              data-cursor="text"
              data-selection="text"
              title={item.name}
            >
              {item.name}
            </span>
            {item.status ? (
              <span
                className="shrink-0 text-muted-foreground"
                data-cursor="text"
                data-selection="text"
                title={item.status}
              >
                {item.status}
              </span>
            ) : null}
          </div>
          {item.source ? (
            <span
              className="min-w-0 truncate text-[11px] text-muted-foreground"
              data-cursor="text"
              data-selection="text"
              title={item.source}
            >
              {item.source}
            </span>
          ) : null}
        </div>
      ))}
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

export function PetSettingsContent({
  initialView = "AGENTS.md",
  onClose,
}: {
  initialView?: SettingsView
  onClose?: () => void
}) {
  const codexConnection = useCodexConnection()

  return (
    <PetSettingsContentSession
      codexConnection={codexConnection}
      initialView={initialView}
      key={`${codexConnection.settings.codexCommand}:${codexConnection.workspaceRootStatus?.settings.rootPath ?? ""}`}
      onClose={onClose}
    />
  )
}

function PetSettingsContentSession({
  codexConnection,
  initialView,
  onClose,
}: {
  codexConnection: ReturnType<typeof useCodexConnection>
  initialView: SettingsView
  onClose?: () => void
}) {
  const runtimeStatus = codexConnection.runtimeStatus
  const [activeView, setActiveView] =
    React.useState<SettingsView>(initialView)
  const [baseline, setBaseline] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "saved">("idle")
  const [draftSettings, setDraftSettings] = React.useState(
    codexConnection.settings
  )
  const [draftWorkspaceRootPath, setDraftWorkspaceRootPath] =
    React.useState("")
  const [workspaceRootNotice, setWorkspaceRootNotice] =
    React.useState<string | null>(null)

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
  const saveCodexSettings = React.useCallback(() => {
    void codexConnection.updateSettings(draftSettings)
  }, [codexConnection, draftSettings])
  const saveWorkspaceRoot = React.useCallback(() => {
    void codexConnection
      .updateWorkspaceRootSettings({ rootPath: draftWorkspaceRootPath })
      .then(() =>
        setWorkspaceRootNotice(
          "Restart Agent-HTML for the workspace root change to take effect."
        )
      )
  }, [codexConnection, draftWorkspaceRootPath])
  const runCodexAction = React.useCallback(
    async (action: (settingsOverride?: typeof draftSettings) => Promise<void>) => {
      await codexConnection.updateSettings(draftSettings)
      try {
        await action(draftSettings)
      } catch {
        // The connection provider owns the visible error state.
      }
    },
    [codexConnection, draftSettings]
  )
  const isRuntimeRefreshDisabled =
    codexConnection.status !== "connected" || runtimeStatus.status === "loading"
  const subtitle =
    runtimeStatus.status === "loading"
      ? "Loading runtime"
      : `${activeView} settings`

  return (
    <SidebarStateProvider>
      <section
        className="flex h-[min(34rem,calc(100vh-5rem))] min-h-96 w-[min(52rem,calc(100vw-4rem))] flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-sm"
        style={
          {
            "--sidebar": "var(--background)",
            "--sidebar-foreground": "var(--foreground)",
            "--sidebar-accent": "var(--muted)",
            "--sidebar-accent-foreground": "var(--foreground)",
            "--sidebar-border": "var(--border)",
            "--sidebar-ring": "var(--ring)",
          } as React.CSSProperties
        }
      >
        <header
          className="flex min-h-14 cursor-grab items-center gap-3 bg-muted/30 px-4 active:cursor-grabbing"
          data-selection="none"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <SettingsIcon aria-hidden="true" className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-medium leading-5">
              AgentHTML settings
            </h2>
            <p className="truncate text-xs leading-4 text-muted-foreground">
              {subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              data-popover-no-drag
              disabled={isRuntimeRefreshDisabled}
              onClick={refreshRuntimeStatus}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <RotateCwIcon aria-hidden="true" className="size-4" />
              <span className="sr-only">
                {runtimeStatus.status === "loading" ? "Loading" : "Refresh"}
              </span>
            </Button>
            <Button
              aria-label="Close settings"
              data-popover-no-drag
              onClick={onClose}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </header>
        <Separator />
        <main className="flex min-h-0 flex-1">
          <aside className="flex w-44 shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
            <SidebarContent data-pet-settings-no-drag="">
              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {settingsViews.map((view) => (
                      <SidebarMenuItem key={view}>
                        <SidebarMenuButton
                          isActive={activeView === view}
                          onClick={() => setActiveView(view)}
                          type="button"
                        >
                          <span className="truncate">{view}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </aside>
          <ScrollArea
            className="min-h-0 min-w-0 flex-1"
            data-pet-settings-no-drag=""
            viewportClassName="p-4"
          >
            <SettingsViewContent
              activeView={activeView}
              canManageHost={codexConnection.canManageHost}
              codexCommand={codexConnection.health?.codexCommand ?? "unknown"}
              codexConnectionStatus={codexConnection.status}
              connectionStatus={codexConnection.status}
              cwd={codexConnection.health?.cwd ?? "unknown"}
              draft={draft}
              draftCodexCommand={draftSettings.codexCommand}
              draftWorkspaceRootPath={draftWorkspaceRootPath}
              error={error}
              healthAppServerRunning={codexConnection.health?.appServerRunning}
              isCodexBusy={codexConnection.isBusy}
              isCodexLoaded={codexConnection.isLoaded}
              isDirty={isDirty}
              isLoading={isLoading}
              isSaving={isSaving}
              lastError={codexConnection.lastError}
              loadInstructions={loadInstructions}
              onDraftCodexCommandChange={(value) =>
                setDraftSettings((current) => ({
                  ...current,
                  codexCommand: value,
                }))
              }
              onDraftWorkspaceRootPathChange={setDraftWorkspaceRootPath}
              onRestart={() => void runCodexAction(codexConnection.restart)}
              onSaveCodexSettings={saveCodexSettings}
              onSaveWorkspaceRoot={saveWorkspaceRoot}
              onStop={() => void runCodexAction(codexConnection.stop)}
              onTestConnection={() => void runCodexAction(codexConnection.test)}
              runtimeStatus={runtimeStatus}
              saveInstructions={saveInstructions}
              setDraft={setDraft}
              setStatus={setStatus}
              status={status}
              workspaceRootNotice={workspaceRootNotice}
              workspaceRootStatus={codexConnection.workspaceRootStatus}
            />
          </ScrollArea>
        </main>
      </section>
    </SidebarStateProvider>
  )
}

function SettingsViewContent({
  activeView,
  canManageHost,
  codexCommand,
  codexConnectionStatus,
  connectionStatus,
  cwd,
  draft,
  draftCodexCommand,
  draftWorkspaceRootPath,
  error,
  healthAppServerRunning,
  isCodexBusy,
  isCodexLoaded,
  isDirty,
  isLoading,
  isSaving,
  lastError,
  loadInstructions,
  onDraftCodexCommandChange,
  onDraftWorkspaceRootPathChange,
  onRestart,
  onSaveCodexSettings,
  onSaveWorkspaceRoot,
  onStop,
  onTestConnection,
  runtimeStatus,
  saveInstructions,
  setDraft,
  setStatus,
  status,
  workspaceRootNotice,
  workspaceRootStatus,
}: {
  activeView: SettingsView
  canManageHost: boolean
  codexCommand: string
  codexConnectionStatus: string
  connectionStatus: string
  cwd: string
  draft: string
  draftCodexCommand: string
  draftWorkspaceRootPath: string
  error: string | null
  healthAppServerRunning?: boolean
  isCodexBusy: boolean
  isCodexLoaded: boolean
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  lastError?: string | null
  loadInstructions: () => Promise<void>
  onDraftCodexCommandChange: (value: string) => void
  onDraftWorkspaceRootPathChange: (value: string) => void
  onRestart: () => void
  onSaveCodexSettings: () => void
  onSaveWorkspaceRoot: () => void
  onStop: () => void
  onTestConnection: () => void
  runtimeStatus: CodexRuntimeStatus
  saveInstructions: () => void
  setDraft: (draft: string) => void
  setStatus: (status: "idle" | "saved") => void
  status: "idle" | "saved"
  workspaceRootNotice?: string | null
  workspaceRootStatus: ReturnType<typeof useCodexConnection>["workspaceRootStatus"]
}) {
  if (activeView === "AGENTS.md") {
    return (
      <AgentsMdView
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
    )
  }

  if (activeView === "MCP") {
    return <McpView runtimeStatus={runtimeStatus} />
  }

  if (activeView === "Skills") {
    return <SkillsView runtimeStatus={runtimeStatus} />
  }

  if (activeView === "Plugins") {
    return <PluginsView runtimeStatus={runtimeStatus} />
  }

  if (activeView === "Runtime") {
    return (
      <RuntimeView
        codexCommand={codexCommand}
        connectionStatus={connectionStatus}
        cwd={cwd}
        runtimeStatus={runtimeStatus}
      />
    )
  }

  return (
    <ConnectionView
      canManageHost={canManageHost}
      codexCommand={codexCommand}
      codexConnectionStatus={codexConnectionStatus}
      connectionStatus={connectionStatus}
      cwd={cwd}
      draftCodexCommand={draftCodexCommand}
      draftWorkspaceRootPath={draftWorkspaceRootPath}
      healthAppServerRunning={healthAppServerRunning}
      isCodexBusy={isCodexBusy}
      isCodexLoaded={isCodexLoaded}
      lastError={lastError}
      onDraftCodexCommandChange={onDraftCodexCommandChange}
      onDraftWorkspaceRootPathChange={onDraftWorkspaceRootPathChange}
      onRestart={onRestart}
      onSaveCodexSettings={onSaveCodexSettings}
      onSaveWorkspaceRoot={onSaveWorkspaceRoot}
      onStop={onStop}
      onTestConnection={onTestConnection}
      workspaceRootNotice={workspaceRootNotice}
      workspaceRootStatus={workspaceRootStatus}
    />
  )
}

function AgentsMdView({
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
    <div className="flex flex-col gap-3">
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
      <footer
        className="flex shrink-0 items-center justify-end gap-2"
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
      </footer>
    </div>
  )
}

function ConnectionView({
  canManageHost,
  codexCommand,
  codexConnectionStatus,
  connectionStatus,
  cwd,
  draftCodexCommand,
  draftWorkspaceRootPath,
  healthAppServerRunning,
  isCodexBusy,
  isCodexLoaded,
  lastError,
  onDraftCodexCommandChange,
  onDraftWorkspaceRootPathChange,
  onRestart,
  onSaveCodexSettings,
  onSaveWorkspaceRoot,
  onStop,
  onTestConnection,
  workspaceRootNotice,
  workspaceRootStatus,
}: {
  canManageHost: boolean
  codexCommand: string
  codexConnectionStatus: string
  connectionStatus: string
  cwd: string
  draftCodexCommand: string
  draftWorkspaceRootPath: string
  healthAppServerRunning?: boolean
  isCodexBusy: boolean
  isCodexLoaded: boolean
  lastError?: string | null
  onDraftCodexCommandChange: (value: string) => void
  onDraftWorkspaceRootPathChange: (value: string) => void
  onRestart: () => void
  onSaveCodexSettings: () => void
  onSaveWorkspaceRoot: () => void
  onStop: () => void
  onTestConnection: () => void
  workspaceRootNotice?: string | null
  workspaceRootStatus: ReturnType<typeof useCodexConnection>["workspaceRootStatus"]
}) {
  return (
    <div className="grid gap-4">
      <section className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium">Status</h3>
          <Badge
            variant={
              codexConnectionStatus === "connected"
                ? "default"
                : codexConnectionStatus === "error"
                  ? "destructive"
                  : "outline"
            }
          >
            {codexConnectionStatus}
          </Badge>
        </div>
        {lastError ? (
          <SettingsInfoPanel variant="destructive">{lastError}</SettingsInfoPanel>
        ) : null}
        {!canManageHost ? (
          <SettingsInfoPanel>
            Desktop runtime required to manage Codex.
          </SettingsInfoPanel>
        ) : null}
      </section>

      <section className="grid gap-3">
        <h3 className="text-sm font-medium">Workspace</h3>
        <div className="grid gap-2">
          <Label htmlFor="pet-settings-workspace-root">
            Custom workspace root
          </Label>
          <Input
            id="pet-settings-workspace-root"
            onChange={(event) =>
              onDraftWorkspaceRootPathChange(event.target.value)
            }
            placeholder={workspaceRootStatus?.defaultRootPath ?? ""}
            value={draftWorkspaceRootPath}
          />
        </div>
        <PathInfoRow
          label="Opened root"
          value={workspaceRootStatus?.rootPath ?? "unknown"}
        />
        <PathInfoRow
          label="Next startup root"
          value={workspaceRootStatus?.pendingRootPath ?? "unknown"}
        />
        <PathInfoRow
          label="Default root"
          value={workspaceRootStatus?.defaultRootPath ?? "unknown"}
        />
        {workspaceRootNotice ? (
          <SettingsInfoPanel>{workspaceRootNotice}</SettingsInfoPanel>
        ) : null}
        <div>
          <Button
            disabled={!canManageHost}
            onClick={onSaveWorkspaceRoot}
            size="sm"
            type="button"
            variant="outline"
          >
            Save workspace root
          </Button>
        </div>
      </section>

      <section className="grid gap-3">
        <h3 className="text-sm font-medium">Host</h3>
        <div className="grid gap-2">
          <Label htmlFor="pet-settings-codex-command">Codex command</Label>
          <Input
            id="pet-settings-codex-command"
            onChange={(event) => onDraftCodexCommandChange(event.target.value)}
            value={draftCodexCommand}
          />
        </div>
        <PathInfoRow label="Codex command" value={codexCommand} />
        <PathInfoRow label="Codex cwd" value={cwd} />
        <PathInfoRow
          label="App server"
          value={healthAppServerRunning ? "running" : "off"}
        />
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onSaveCodexSettings} size="sm" type="button" variant="outline">
            Save
          </Button>
          <Button
            disabled={isCodexBusy}
            onClick={onTestConnection}
            size="sm"
            type="button"
            variant="outline"
          >
            Test connection
          </Button>
          <Button
            disabled={
              isCodexBusy || !isCodexLoaded || connectionStatus === "disconnected"
            }
            onClick={onStop}
            size="sm"
            type="button"
            variant="outline"
          >
            Stop
          </Button>
          <Button
            disabled={isCodexBusy || !isCodexLoaded}
            onClick={onRestart}
            size="sm"
            type="button"
          >
            Restart
          </Button>
        </div>
      </section>

    </div>
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
      <CapabilityItemList
        items={runtimeStatus.capabilities.skills.items}
        runtimeStatus={runtimeStatus.status}
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
      <CapabilityItemList
        items={runtimeStatus.capabilities.mcpServers.items}
        runtimeStatus={runtimeStatus.status}
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
      <CapabilityItemList
        items={runtimeStatus.capabilities.plugins.items}
        runtimeStatus={runtimeStatus.status}
      />
      <CapabilityRow
        label="Codex apps"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.apps}
      />
      <CapabilityItemList
        items={runtimeStatus.capabilities.apps.items}
        runtimeStatus={runtimeStatus.status}
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
          value={
            runtimeStatus.config.sandboxMode ??
            runtimeStatus.config.sandboxModeDiagnostic ??
            "unknown"
          }
        />
        <RuntimeField
          label="Approvals"
          value={
            runtimeStatus.config.approvalPolicy ??
            runtimeStatus.config.approvalPolicyDiagnostic ??
            "unknown"
          }
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
