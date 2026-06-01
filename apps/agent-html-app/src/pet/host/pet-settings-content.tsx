import * as React from "react"
import { RotateCwIcon, SaveIcon, SettingsIcon, XIcon } from "lucide-react"

import { useCodexConnection } from "@/app/codex/connection"
import type {
  CodexConnectionSettings,
  CodexConnectionStatus,
  CodexHostHealth,
  CodexRuntimeCapabilityStatus,
  CodexRuntimeStatus,
} from "@/app/codex/connection"
import type {
  CodexRuntimeCapabilityItem,
  WorkspaceRootStatus,
} from "@/app/codex/connection/types"
import type { CodexSettingsMutation } from "@/app/codex/connection/codex-settings-service"
import {
  createConfigValueWriteMutation,
  createSkillConfigMutation,
  createWriteCodexTextFileMutation,
  resolveRootAgentsPath,
} from "@/app/codex/connection/codex-settings-service"
import {
  AGENTS_READ_TIMEOUT_MS,
  loadAgentsInstructions,
  type AgentsInstructionsSource,
} from "@/app/pet/host/agents-instructions-loader"
import { writeConnectionTrace } from "@/app/codex/connection"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/shared/ui/alert-dialog"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import { Input } from "@/app/shared/ui/input"
import { Label } from "@/app/shared/ui/label"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import { Separator } from "@/app/shared/ui/separator"
import { Skeleton } from "@/app/shared/ui/skeleton"
import { Spinner } from "@/app/shared/ui/spinner"
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
import { cn } from "@/app/shared/lib/utils"

const settingsViews = [
  "AGENTS.md",
  "MCP",
  "Skills",
  "Plugins",
  "Runtime",
  "Connection",
] as const

type SettingsView = (typeof settingsViews)[number]

export type PetSettingsView = SettingsView

export type PetSettingsSurfaceSnapshot = {
  activeView: SettingsView
  agents: {
    draft: string
    error: string | null
    isDirty: boolean
    isLoading: boolean
    isSaving: boolean
    path: string | null
    source: AgentsInstructionsSource | null
    status: "idle" | "saved"
  }
  codex: {
    canManageHost: boolean
    draftSettings: CodexConnectionSettings
    draftWorkspaceRootPath: string
    health: CodexHostHealth | null
    isBusy: boolean
    isLoaded: boolean
    lastError: string | null
    mutationError: string | null
    pendingMutation: CodexSettingsMutation | null
    runtimeStatus: CodexRuntimeStatus
    status: CodexConnectionStatus
    workspaceRootNotice: string | null
    workspaceRootStatus: WorkspaceRootStatus | null
  }
}

export type PetSettingsAction =
  | { type: "close" }
  | { type: "cancel-mutation" }
  | { type: "confirm-mutation" }
  | { type: "refresh-runtime-status" }
  | { type: "reload-agents-instructions" }
  | { mutation: CodexSettingsMutation; type: "queue-mutation" }
  | { draft: string; type: "set-agents-draft" }
  | { type: "save-agents-instructions" }
  | { command: string; type: "set-codex-command" }
  | { path: string; type: "set-workspace-root-path" }
  | { type: "save-codex-settings" }
  | { type: "save-workspace-root" }
  | { type: "restart-codex" }
  | { type: "stop-codex" }
  | { type: "test-codex" }
  | { type: "set-active-view"; view: SettingsView }

export type PetSettingsDispatch = (action: PetSettingsAction) => void

export type PetSettingsBridge = {
  dispatch: PetSettingsDispatch
  snapshot: PetSettingsSurfaceSnapshot
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Unable to update AGENTS.md."
}

function isNonBlockingCodexNoise(message: string | null | undefined) {
  if (!message) {
    return false
  }

  return (
    message.includes("rmcp::transport::worker") ||
    (message.includes("Transport channel closed") &&
      message.includes("developers.openai.com/mcp")) ||
    (message.includes("http/request failed") &&
      message.includes("developers.openai.com/mcp"))
  )
}

function formatCapability(
  capability: CodexRuntimeCapabilityStatus,
  runtimeStatus: CodexRuntimeStatus["status"]
) {
  if (runtimeStatus === "idle") {
    return "Not loaded"
  }

  if (runtimeStatus === "loading") {
    return ""
  }

  if (!capability.ok) {
    return capability.error ?? "Unavailable"
  }

  return typeof capability.count === "number"
    ? `${capability.count} available`
    : "Available"
}

function SettingsSectionHeader({
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
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-xs">
      <h3 className="text-sm font-medium" data-selection="none">
        {label}
      </h3>
      <span
        className={isUnavailable ? "text-destructive" : "text-muted-foreground"}
        data-cursor={isUnavailable ? "text" : undefined}
        data-selection={isUnavailable ? "text" : "none"}
      >
        {runtimeStatus === "loading" ? (
          <Skeleton className="h-3 w-16" />
        ) : (
          formatCapability(status, runtimeStatus)
        )}
      </span>
    </div>
  )
}

function CapabilityNameList({
  emptyLabel = "No items reported",
  items,
  onCreateToggleMutation,
  onQueueMutation,
  runtimeStatus,
}: {
  emptyLabel?: string
  items?: CodexRuntimeCapabilityItem[]
  onCreateToggleMutation?: (
    item: CodexRuntimeCapabilityItem,
    enabled: boolean
  ) => CodexSettingsMutation | null
  onQueueMutation?: (mutation: CodexSettingsMutation) => void
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
    <ScrollArea className="max-h-56">
      <div className="grid gap-1.5">
        {items.map((item) => (
          <div
            className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted/40"
            key={`${item.id ?? item.name}:${item.path ?? item.source ?? ""}`}
          >
            <span
              className="block min-w-0 flex-1 truncate font-medium"
              data-cursor="text"
              data-selection="text"
              title={item.name}
            >
              {item.name}
            </span>
            <CapabilityItemMeta item={item} />
            {onCreateToggleMutation ? (
              <CapabilitySwitch
                item={item}
                onCreateMutation={onCreateToggleMutation}
                onQueueMutation={onQueueMutation}
              />
            ) : null}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function CapabilityItemMeta({ item }: { item: CodexRuntimeCapabilityItem }) {
  const label =
    item.scope ??
    item.authStatus ??
    (typeof item.childrenCount === "number"
      ? `${item.childrenCount} items`
      : undefined) ??
    item.status

  if (!label) {
    return null
  }

  return (
    <Badge className="shrink-0 font-normal" variant="outline">
      {label}
    </Badge>
  )
}

function CapabilitySwitch({
  item,
  onCreateMutation,
  onQueueMutation,
}: {
  item: CodexRuntimeCapabilityItem
  onCreateMutation: (
    item: CodexRuntimeCapabilityItem,
    enabled: boolean
  ) => CodexSettingsMutation | null
  onQueueMutation?: (mutation: CodexSettingsMutation) => void
}) {
  const enabled = item.enabled !== false
  const nextEnabled = !enabled
  const mutation = onCreateMutation(item, nextEnabled)

  if (!mutation) {
    return (
      <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
        Read-only
      </span>
    )
  }

  return (
    <button
      aria-checked={enabled}
      aria-label={`${enabled ? "Disable" : "Enable"} ${item.name}`}
      className={cn(
        "inline-flex h-5 w-9 shrink-0 items-center rounded-full border px-0.5 transition-colors",
        enabled
          ? "border-primary bg-primary"
          : "border-border bg-muted"
      )}
      data-popover-no-drag
      data-window-no-drag
      onClick={() => {
        const nextMutation = onCreateMutation(item, nextEnabled)
        if (nextMutation) {
          onQueueMutation?.(nextMutation)
        }
      }}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "size-4 rounded-full bg-background shadow-sm transition-transform",
          enabled ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

export function PetSettingsContent({
  active = true,
  initialView = "AGENTS.md",
  onBridgeChange,
  onClose,
  renderSurface = true,
}: {
  active?: boolean
  initialView?: SettingsView
  onBridgeChange?: (bridge: PetSettingsBridge) => void
  onClose?: () => void
  renderSurface?: boolean
}) {
  const codexConnection = useCodexConnection()

  return (
    <PetSettingsContentSession
      codexConnection={codexConnection}
      active={active}
      initialView={initialView}
      key={`${codexConnection.settings.codexCommand}:${codexConnection.workspaceRootStatus?.settings.rootPath ?? ""}`}
      onBridgeChange={onBridgeChange}
      onClose={onClose}
      renderSurface={renderSurface}
    />
  )
}

function PetSettingsContentSession({
  active,
  codexConnection,
  initialView,
  onBridgeChange,
  onClose,
  renderSurface,
}: {
  active: boolean
  codexConnection: ReturnType<typeof useCodexConnection>
  initialView: SettingsView
  onBridgeChange?: (bridge: PetSettingsBridge) => void
  onClose?: () => void
  renderSurface: boolean
}) {
  const runtimeStatus = codexConnection.runtimeStatus
  const [activeView, setActiveView] =
    React.useState<SettingsView>(initialView)
  const [baseline, setBaseline] = React.useState("")
  const [draft, setDraft] = React.useState("")
  const [agentsPath, setAgentsPath] = React.useState<string | null>(null)
  const [agentsSource, setAgentsSource] =
    React.useState<AgentsInstructionsSource | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [mutationError, setMutationError] = React.useState<string | null>(null)
  const [pendingMutation, setPendingMutation] =
    React.useState<CodexSettingsMutation | null>(null)
  const [status, setStatus] = React.useState<"idle" | "saved">("idle")
  const [draftSettings, setDraftSettings] = React.useState(
    codexConnection.settings
  )
  const [draftWorkspaceRootPath, setDraftWorkspaceRootPath] =
    React.useState("")
  const [workspaceRootNotice, setWorkspaceRootNotice] =
    React.useState<string | null>(null)
  const readInstructionsSeqRef = React.useRef(0)

  const isDirty = draft !== baseline

  const readInstructions = React.useCallback(() => {
    const sequence = readInstructionsSeqRef.current + 1
    readInstructionsSeqRef.current = sequence
    const path = resolveRootAgentsPath(codexConnection.workspaceRootStatus)
    setAgentsPath(path)

    return loadAgentsInstructions({
      codexRequest: codexConnection.request,
      path,
      readWorkspaceInstructions: () =>
        createWorkspaceStore().getRootAgentsInstructions(),
      sequence,
      timeoutMs: AGENTS_READ_TIMEOUT_MS,
      trace: writeConnectionTrace,
    })
      .then((result) => {
        if (readInstructionsSeqRef.current !== sequence) {
          writeConnectionTrace("settings:agents:final", {
            isStale: true,
            sequence,
          })
          return
        }
        setBaseline(result.text)
        setDraft(result.text)
        setAgentsSource(result.source)
        setStatus("idle")
        writeConnectionTrace("settings:agents:final", {
          isStale: false,
          length: result.text.length,
          sequence,
          source: result.source,
        })
      })
      .catch((loadError: unknown) => {
        if (readInstructionsSeqRef.current !== sequence) {
          writeConnectionTrace("settings:agents:final", {
            isStale: true,
            sequence,
          })
          return
        }
        setAgentsSource(null)
        setError(getErrorMessage(loadError))
        writeConnectionTrace("settings:agents:final", {
          error: getErrorMessage(loadError),
          isStale: false,
          sequence,
        })
      })
      .finally(() => {
        if (readInstructionsSeqRef.current === sequence) {
          setIsLoading(false)
        }
      })
  }, [
    codexConnection.request,
    codexConnection.workspaceRootStatus,
  ])

  const loadInstructions = React.useCallback(() => {
    setError(null)
    setIsLoading(true)
    return readInstructions()
  }, [readInstructions])

  React.useEffect(() => {
    if (!active) {
      return
    }

    void readInstructions()
  }, [active, readInstructions])

  const saveInstructions = React.useCallback(() => {
    setError(null)
    setStatus("idle")
    if (!agentsPath && agentsSource !== "workspace") {
      setError("Workspace root AGENTS.md path is unavailable.")
      return
    }

    if (agentsSource === "workspace") {
      setIsSaving(true)
      void createWorkspaceStore()
        .updateRootAgentsInstructions({ source: draft })
        .then((savedSource) => {
          setBaseline(savedSource)
          setDraft(savedSource)
          setStatus("saved")
        })
        .catch((saveError: unknown) => {
          setError(getErrorMessage(saveError))
        })
        .finally(() => {
          setIsSaving(false)
        })
      return
    }

    setPendingMutation(createWriteCodexTextFileMutation(agentsPath, draft))
  }, [agentsPath, agentsSource, draft])

  const queueMutation = React.useCallback((mutation: CodexSettingsMutation) => {
    setMutationError(null)
    setPendingMutation(mutation)
  }, [])

  const cancelMutation = React.useCallback(() => {
    setPendingMutation(null)
  }, [])

  const confirmMutation = React.useCallback(async () => {
    if (!pendingMutation) {
      return
    }

    setMutationError(null)
    if (pendingMutation.method === "fs/writeFile") {
      setError(null)
      setIsSaving(true)
    }

    try {
      await codexConnection.request(pendingMutation.method, pendingMutation.params)
      if (pendingMutation.method === "fs/writeFile") {
        setBaseline(draft)
        setStatus("saved")
      }
      setPendingMutation(null)
      void codexConnection.refreshRuntimeStatus()
    } catch (mutationFailure: unknown) {
      const message = getErrorMessage(mutationFailure)
      if (pendingMutation.method === "fs/writeFile") {
        setError(message)
      } else {
        setMutationError(message)
      }
    } finally {
      setIsSaving(false)
    }
  }, [codexConnection, draft, pendingMutation])

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
  const subtitle =
    runtimeStatus.status === "loading"
      ? "Loading runtime"
      : `${activeView} settings`

  const snapshot = React.useMemo<PetSettingsSurfaceSnapshot>(
    () => ({
      activeView,
      agents: {
        draft,
        error,
        isDirty,
        isLoading,
        isSaving,
        path: agentsPath,
        source: agentsSource,
        status,
      },
      codex: {
        canManageHost: codexConnection.canManageHost,
        draftSettings,
        draftWorkspaceRootPath,
        health: codexConnection.health,
        isBusy: codexConnection.isBusy,
        isLoaded: codexConnection.isLoaded,
        lastError: codexConnection.lastError,
        mutationError,
        pendingMutation,
        runtimeStatus,
        status: codexConnection.status,
        workspaceRootNotice,
        workspaceRootStatus: codexConnection.workspaceRootStatus,
      },
    }),
    [
      activeView,
      agentsPath,
      agentsSource,
      codexConnection.canManageHost,
      codexConnection.health,
      codexConnection.isBusy,
      codexConnection.isLoaded,
      codexConnection.lastError,
      codexConnection.status,
      codexConnection.workspaceRootStatus,
      draft,
      draftSettings,
      draftWorkspaceRootPath,
      error,
      isDirty,
      isLoading,
      isSaving,
      mutationError,
      pendingMutation,
      runtimeStatus,
      status,
      workspaceRootNotice,
    ]
  )

  const dispatch = React.useCallback<PetSettingsDispatch>(
    (action) => {
      switch (action.type) {
        case "close":
          onClose?.()
          return
        case "cancel-mutation":
          cancelMutation()
          return
        case "confirm-mutation":
          void confirmMutation()
          return
        case "refresh-runtime-status":
          refreshRuntimeStatus()
          return
        case "reload-agents-instructions":
          void loadInstructions()
          return
        case "queue-mutation":
          queueMutation(action.mutation)
          return
        case "set-agents-draft":
          setDraft(action.draft)
          setStatus("idle")
          return
        case "save-agents-instructions":
          saveInstructions()
          return
        case "set-codex-command":
          setDraftSettings((current) => ({
            ...current,
            codexCommand: action.command,
          }))
          return
        case "set-workspace-root-path":
          setDraftWorkspaceRootPath(action.path)
          return
        case "save-codex-settings":
          saveCodexSettings()
          return
        case "save-workspace-root":
          saveWorkspaceRoot()
          return
        case "restart-codex":
          void runCodexAction(codexConnection.restart)
          return
        case "stop-codex":
          void runCodexAction(codexConnection.stop)
          return
        case "test-codex":
          void runCodexAction(codexConnection.test)
          return
        case "set-active-view":
          setActiveView(action.view)
          return
      }
    },
    [
      codexConnection.restart,
      codexConnection.stop,
      codexConnection.test,
      cancelMutation,
      confirmMutation,
      loadInstructions,
      onClose,
      queueMutation,
      refreshRuntimeStatus,
      runCodexAction,
      saveCodexSettings,
      saveInstructions,
      saveWorkspaceRoot,
    ]
  )

  const bridge = React.useMemo<PetSettingsBridge>(
    () => ({ dispatch, snapshot }),
    [dispatch, snapshot]
  )

  React.useEffect(() => {
    onBridgeChange?.(bridge)
  }, [bridge, onBridgeChange])

  if (!renderSurface) {
    return null
  }

  return <PetSettingsSurface bridge={bridge} subtitle={subtitle} />
}

export function PetSettingsSurface({
  bridge,
  className,
  headerSlot,
  renderHeader = true,
  subtitle,
}: {
  bridge: PetSettingsBridge
  className?: string
  headerSlot?: (header: React.ReactNode) => React.ReactNode
  renderHeader?: boolean
  subtitle?: string
}) {
  const { dispatch, snapshot } = bridge
  const { activeView, agents, codex } = snapshot
  const runtimeStatus = codex.runtimeStatus
  const isRuntimeRefreshDisabled =
    codex.status !== "connected" || runtimeStatus.status === "loading"
  const resolvedSubtitle =
    subtitle ??
    (runtimeStatus.status === "loading"
      ? "Loading runtime"
      : `${activeView} settings`)
  const header = (
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
          {resolvedSubtitle}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          data-popover-no-drag
          data-window-no-drag
          disabled={isRuntimeRefreshDisabled}
          onClick={() => dispatch({ type: "refresh-runtime-status" })}
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
          data-window-no-drag
          onClick={() => dispatch({ type: "close" })}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <XIcon aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </header>
  )

  return (
    <SidebarStateProvider>
      <section
        className={cn(
          "flex h-[min(34rem,calc(100vh-5rem))] min-h-96 w-[min(52rem,calc(100vw-4rem))] flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-sm",
          className
        )}
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
        {renderHeader ? (headerSlot ? headerSlot(header) : header) : null}
        {renderHeader ? <Separator /> : null}
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
                          onClick={() =>
                            dispatch({ type: "set-active-view", view })
                          }
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
            <div className="grid gap-3">
              {codex.mutationError ? (
                <SettingsInfoPanel variant="destructive">
                  {codex.mutationError}
                </SettingsInfoPanel>
              ) : null}
              <SettingsViewContent
                activeView={activeView}
                agentsPath={agents.path}
                canManageHost={codex.canManageHost}
                codexCommand={codex.health?.codexCommand ?? "unknown"}
                codexConnectionStatus={codex.status}
                connectionStatus={codex.status}
                cwd={codex.health?.cwd ?? "unknown"}
                draft={agents.draft}
                draftCodexCommand={codex.draftSettings.codexCommand}
                draftWorkspaceRootPath={codex.draftWorkspaceRootPath}
                error={agents.error}
                healthAppServerRunning={codex.health?.appServerRunning}
                isCodexBusy={codex.isBusy}
                isCodexLoaded={codex.isLoaded}
                isDirty={agents.isDirty}
                isLoading={agents.isLoading}
                isSaving={agents.isSaving}
                lastError={codex.lastError}
                loadInstructions={() => {
                  dispatch({ type: "reload-agents-instructions" })
                }}
                onDraftCodexCommandChange={(command) =>
                  dispatch({ command, type: "set-codex-command" })
                }
                onDraftWorkspaceRootPathChange={(path) =>
                  dispatch({ path, type: "set-workspace-root-path" })
                }
                onRestart={() => dispatch({ type: "restart-codex" })}
                onSaveCodexSettings={() =>
                  dispatch({ type: "save-codex-settings" })
                }
                onSaveWorkspaceRoot={() =>
                  dispatch({ type: "save-workspace-root" })
                }
                onStop={() => dispatch({ type: "stop-codex" })}
                onTestConnection={() => dispatch({ type: "test-codex" })}
                queueMutation={(mutation) =>
                  dispatch({ mutation, type: "queue-mutation" })
                }
                runtimeStatus={runtimeStatus}
                saveInstructions={() => {
                  dispatch({ type: "save-agents-instructions" })
                }}
                source={agents.source}
                setDraft={(draft) =>
                  dispatch({ draft, type: "set-agents-draft" })
                }
                status={agents.status}
                workspaceRootNotice={codex.workspaceRootNotice}
                workspaceRootStatus={codex.workspaceRootStatus}
              />
            </div>
          </ScrollArea>
        </main>
      </section>
      <ConfirmSettingsMutationDialog
        mutation={codex.pendingMutation}
        onCancel={() => dispatch({ type: "cancel-mutation" })}
        onConfirm={() => dispatch({ type: "confirm-mutation" })}
      />
    </SidebarStateProvider>
  )
}

function DetailsBlock({
  children,
  label = "Details",
}: {
  children: React.ReactNode
  label?: string
}) {
  return (
    <details className="group text-xs text-muted-foreground">
      <summary
        className="cursor-pointer select-none py-1 font-medium text-foreground/80 marker:text-muted-foreground"
        data-selection="none"
      >
        {label}
      </summary>
      <div className="mt-2 grid gap-1.5 border-l border-border/60 pl-3">
        {children}
      </div>
    </details>
  )
}

function CompactMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
      <span data-selection="none">{label}</span>
      <span className="break-all text-foreground" data-cursor="text" data-selection="text">
        {value}
      </span>
    </div>
  )
}

function SettingsViewContent({
  activeView,
  agentsPath,
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
  source,
  status,
  queueMutation,
  workspaceRootNotice,
  workspaceRootStatus,
}: {
  activeView: SettingsView
  agentsPath: string | null
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
  loadInstructions: () => Promise<void> | void
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
  source: AgentsInstructionsSource | null
  status: "idle" | "saved"
  queueMutation: (mutation: CodexSettingsMutation) => void
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
        path={agentsPath}
        saveInstructions={saveInstructions}
        source={source}
        setDraft={setDraft}
        status={status}
      />
    )
  }

  if (activeView === "MCP") {
    return <McpView queueMutation={queueMutation} runtimeStatus={runtimeStatus} />
  }

  if (activeView === "Skills") {
    return <SkillsView queueMutation={queueMutation} runtimeStatus={runtimeStatus} />
  }

  if (activeView === "Plugins") {
    return <PluginsView queueMutation={queueMutation} runtimeStatus={runtimeStatus} />
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

function ConfirmSettingsMutationDialog({
  mutation,
  onCancel,
  onConfirm,
}: {
  mutation: CodexSettingsMutation | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={Boolean(mutation)} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{mutation?.title ?? "Confirm change"}</AlertDialogTitle>
          <AlertDialogDescription>
            {mutation?.description ??
              "This will send a write request to the Codex app-server."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs">
          {mutation?.method ?? "unknown"}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AgentsMdView({
  draft,
  error,
  isDirty,
  isLoading,
  isSaving,
  loadInstructions,
  path,
  saveInstructions,
  setDraft,
  source,
  status,
}: {
  draft: string
  error: string | null
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  loadInstructions: () => Promise<void> | void
  path: string | null
  saveInstructions: () => void
  setDraft: (draft: string) => void
  source: AgentsInstructionsSource | null
  status: "idle" | "saved"
}) {
  if (isLoading) {
    return <SettingsFormSkeleton />
  }

  return (
    <div className="flex flex-col gap-3">
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
            data-cursor="text"
            data-selection="text"
            title={path ?? "AGENTS.md"}
          >
            {isDirty ? "Unsaved" : path ?? "AGENTS.md"}
          </span>
        </div>
        <Textarea
          aria-label="AgentHTML AGENTS.md content"
          className="h-72 min-h-0 resize-none overflow-auto font-mono text-xs leading-relaxed"
          disabled={isLoading || isSaving}
          id="pet-agent-instructions"
          onChange={(event) => {
            setDraft(event.target.value)
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
        <SettingsInfoPanel>
          {source === "workspace" ? "Saved locally." : "Saved."}
        </SettingsInfoPanel>
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
          {isSaving ? (
            <Spinner className="size-3.5" />
          ) : (
            <SaveIcon aria-hidden="true" className="size-3.5" />
          )}
          {isSaving ? "Saving" : "Save"}
        </Button>
      </footer>
    </div>
  )
}

function SettingsFormSkeleton() {
  return (
    <div className="flex flex-col gap-3" data-selection="none">
      <Skeleton className="h-9 w-full" />
      <div className="flex min-h-0 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
      <footer className="flex shrink-0 items-center justify-end gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
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
  const hiddenDiagnostic = isNonBlockingCodexNoise(lastError) ? lastError : null
  const visibleError = hiddenDiagnostic ? null : lastError

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
        {visibleError ? (
          <SettingsInfoPanel variant="destructive">{visibleError}</SettingsInfoPanel>
        ) : null}
        {hiddenDiagnostic ? (
          <DetailsBlock label="Diagnostics">
            <CompactMetaRow label="Hidden" value={hiddenDiagnostic} />
          </DetailsBlock>
        ) : null}
        {!canManageHost ? (
          <SettingsInfoPanel>
            Desktop runtime required to manage Codex.
          </SettingsInfoPanel>
        ) : null}
      </section>

      <section className="grid gap-3 border-t border-border/60 pt-3">
        <h3 className="text-sm font-medium" data-selection="none">
          Workspace
        </h3>
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
        <DetailsBlock>
          <CompactMetaRow
            label="Opened root"
            value={workspaceRootStatus?.rootPath ?? "unknown"}
          />
          <CompactMetaRow
            label="Next startup"
            value={workspaceRootStatus?.pendingRootPath ?? "unknown"}
          />
          <CompactMetaRow
            label="Default root"
            value={workspaceRootStatus?.defaultRootPath ?? "unknown"}
          />
        </DetailsBlock>
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

      <section className="grid gap-3 border-t border-border/60 pt-3">
        <h3 className="text-sm font-medium" data-selection="none">
          Host
        </h3>
        <div className="grid gap-2">
          <Label htmlFor="pet-settings-codex-command">Codex command</Label>
          <Input
            id="pet-settings-codex-command"
            onChange={(event) => onDraftCodexCommandChange(event.target.value)}
            value={draftCodexCommand}
          />
        </div>
        <div className="grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2">
          <RuntimeField label="Command" value={codexCommand} />
          <RuntimeField label="Cwd" value={cwd} />
          <RuntimeField
            label="App server"
            value={healthAppServerRunning ? "running" : "off"}
          />
        </div>
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
  queueMutation,
  runtimeStatus,
}: {
  queueMutation: (mutation: CodexSettingsMutation) => void
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <SettingsSectionHeader
        label="Codex skills"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.skills}
      />
      <CapabilityNameList
        emptyLabel="No skills reported"
        items={runtimeStatus.capabilities.skills.items}
        onCreateToggleMutation={createSkillConfigMutation}
        onQueueMutation={queueMutation}
        runtimeStatus={runtimeStatus.status}
      />
      <DetailsBlock>
        <CompactMetaRow
          label="Managed skill"
          value="AgentHTML/.agents/skills/agent-html/SKILL.md"
        />
        <CompactMetaRow
          label="Schema"
          value="AgentHTML/.agents/skills/agent-html/references/prompt-schema.md"
        />
      </DetailsBlock>
    </div>
  )
}

function McpView({
  queueMutation,
  runtimeStatus,
}: {
  queueMutation: (mutation: CodexSettingsMutation) => void
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <SettingsSectionHeader
        label="MCP servers"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.mcpServers}
      />
      <CapabilityNameList
        emptyLabel="No MCP servers reported"
        items={runtimeStatus.capabilities.mcpServers.items}
        onCreateToggleMutation={createMcpEnabledMutation}
        onQueueMutation={queueMutation}
        runtimeStatus={runtimeStatus.status}
      />
      <DetailsBlock>
        <CompactMetaRow label="Config" value="~/.codex/config.toml" />
        <CompactMetaRow label="Key" value="mcp_servers.<name>.enabled" />
      </DetailsBlock>
    </div>
  )
}

function PluginsView({
  queueMutation,
  runtimeStatus,
}: {
  queueMutation: (mutation: CodexSettingsMutation) => void
  runtimeStatus: CodexRuntimeStatus
}) {
  return (
    <div className="grid gap-3">
      <SettingsSectionHeader
        label="Codex plugins"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.plugins}
      />
      <CapabilityNameList
        emptyLabel="No plugins reported"
        items={runtimeStatus.capabilities.plugins.items}
        runtimeStatus={runtimeStatus.status}
      />
      <SettingsSectionHeader
        label="Codex apps"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.apps}
      />
      <CapabilityNameList
        emptyLabel="No apps reported"
        items={runtimeStatus.capabilities.apps.items}
        onCreateToggleMutation={createAppEnabledMutation}
        onQueueMutation={queueMutation}
        runtimeStatus={runtimeStatus.status}
      />
      <DetailsBlock>
        <CompactMetaRow label="Workspace" value="AgentHTML/plugins/" />
        <CompactMetaRow label="App key" value="apps.<id>.enabled" />
        <CompactMetaRow label="Plugins" value="read-only" />
      </DetailsBlock>
    </div>
  )
}

function createMcpEnabledMutation(
  item: CodexRuntimeCapabilityItem,
  enabled: boolean
) {
  const id = item.id ?? item.name
  if (!isConfigPathSegment(id)) {
    return null
  }

  return createConfigValueWriteMutation({
    description: `${enabled ? "Enable" : "Disable"} MCP server ${item.name}.`,
    keyPath: `mcp_servers.${id}.enabled`,
    title: `${enabled ? "Enable" : "Disable"} MCP server`,
    value: enabled,
  })
}

function createAppEnabledMutation(
  item: CodexRuntimeCapabilityItem,
  enabled: boolean
) {
  if (!isConfigPathSegment(item.id)) {
    return null
  }

  return createConfigValueWriteMutation({
    description: `${enabled ? "Enable" : "Disable"} app ${item.name}.`,
    keyPath: `apps.${item.id}.enabled`,
    title: `${enabled ? "Enable" : "Disable"} app`,
    value: enabled,
  })
}

function isConfigPathSegment(value: string | undefined) {
  return Boolean(value && !value.includes("."))
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
      <SettingsSectionHeader
        label="Runtime config"
        runtimeStatus={runtimeStatus.status}
        status={runtimeStatus.capabilities.config}
      />
      <div className="grid gap-x-5 gap-y-2 text-xs sm:grid-cols-2">
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
