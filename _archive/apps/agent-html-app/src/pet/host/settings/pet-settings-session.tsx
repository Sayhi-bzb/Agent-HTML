import * as React from "react"

import { useCodexConnection } from "@/app/codex/connection"
import type { CodexSettingsMutation } from "@/app/codex/connection/codex-settings-service"
import {
  createWriteCodexTextFileMutation,
  resolveRootAgentsPath,
} from "@/app/codex/connection/codex-settings-service"
import {
  AGENTS_READ_TIMEOUT_MS,
  loadAgentsInstructions,
  type AgentsInstructionsSource,
} from "@/app/pet/host/agents-instructions-loader"
import { writeConnectionTrace } from "@/app/codex/connection"
import { createWorkspaceStore } from "@/app/workspace/store"

import { PetSettingsSurface } from "./pet-settings-surface"
import type { PetSettingsBridge, PetSettingsDispatch, PetSettingsSurfaceSnapshot, SettingsView } from "./types"
import { getErrorMessage } from "./utils"

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

    const timeoutId = window.setTimeout(() => {
      void readInstructions()
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [active, readInstructions])

  const saveInstructions = React.useCallback(() => {
    setError(null)
    setStatus("idle")
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

    if (!agentsPath) {
      setError("Workspace root AGENTS.md path is unavailable.")
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
