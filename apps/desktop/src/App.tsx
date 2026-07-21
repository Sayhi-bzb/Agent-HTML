import { FolderOpen, LoaderCircle, Plus, RotateCcw } from "lucide-react"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  createCanvasThemeBootstrapMessage,
  readCanvasThemeSnapshot,
  type CanvasThemeSnapshot,
  type CanvasThemeMode,
} from "../../../packages/cli/src/host/theme/theme-sync-contract"
import {
  createCanvasNavigationCommandMessage,
  createCanvasNavigationRequestMessage,
  type ArtifactTitleRenameResult,
  type CanvasNavigationCommand,
  type CanvasNavigationSnapshot,
} from "../../../packages/cli/src/host/navigation/navigation-sync-contract"
import { isArtifactSearchShortcut } from "../../../packages/cli/src/host/navigation/artifact-search-shortcut"
import { agentHtmlBrandName } from "../../../packages/cli/src/shared/brand"
import { AgentHtmlGhostIcon } from "../../../packages/cli/src/shared/brand-icons"

import {
  desktopApi,
  selectWorkspaceFolder,
  type DesktopSnapshot,
} from "./desktop-api"
import { defaultPreferences } from "./preferences"
import {
  readySession,
  workspaceError,
  type WorkspaceError,
  type WorkspaceSession,
} from "./session"
import { Button, Status } from "./ui"
import {
  readTrustedDesktopArtifactTitleRenameResult,
  readTrustedDesktopNavigationSnapshot,
} from "./navigation"
import {
  readTrustedDesktopThemeMessage,
  readTrustedDesktopThemeRequest,
  resolveDesktopRuntimeOrigin,
  watchDesktopTheme,
} from "./theme"
import { DesktopTitleBar } from "./title-bar"

const emptySnapshot: DesktopSnapshot = {
  canvasTheme: null,
  preferences: defaultPreferences,
  recents: [],
}

type PendingWorkspaceAction =
  | "create"
  | "open"
  | { path: string; type: "recent" }

function normalizeDesktopSnapshot(snapshot: DesktopSnapshot): DesktopSnapshot {
  return {
    ...snapshot,
    canvasTheme: readCanvasThemeSnapshot(snapshot.canvasTheme),
  }
}

export default function App() {
  const [snapshot, setSnapshot] = useState(emptySnapshot)
  const [session, setSession] = useState<WorkspaceSession>({ status: "idle" })
  const [canvasNavigation, setCanvasNavigation] =
    useState<CanvasNavigationSnapshot | null>(null)
  const [artifactTitleRenameResult, setArtifactTitleRenameResult] =
    useState<ArtifactTitleRenameResult | null>(null)
  const [pendingWorkspaceAction, setPendingWorkspaceAction] =
    useState<PendingWorkspaceAction | null>(null)
  const runtimeFrameRef = useRef<HTMLIFrameElement>(null)
  const canvasThemeRef = useRef<CanvasThemeSnapshot | null>(null)
  const themeSaveTimerRef = useRef<number | null>(null)
  const pendingThemeRef = useRef<CanvasThemeSnapshot | null>(null)
  const busy = ["opening", "initializing", "starting", "closing"].includes(
    session.status
  )
  const runtimeOrigin =
    session.status === "ready"
      ? resolveDesktopRuntimeOrigin(session.bootstrapUrl)
      : null
  useEffect(() => {
    desktopApi
      .snapshot()
      .then((nextSnapshot) =>
        setSnapshot(normalizeDesktopSnapshot(nextSnapshot))
      )
      .catch(() => {})
  }, [])

  useEffect(() => {
    canvasThemeRef.current = snapshot.canvasTheme
  }, [snapshot.canvasTheme])

  useEffect(() => {
    const unlisten = listen<WorkspaceError>(
      "desktop://runtime-crashed",
      (event) => {
        setSession((current) => ({
          status: "failed",
          root: "root" in current ? current.root : undefined,
          error: event.payload,
        }))
      }
    )
    return () => {
      void unlisten.then((dispose) => dispose())
    }
  }, [])

  useEffect(() => {
    const unlisten = listen<{
      root: string
      status: "opening" | "initializing" | "starting"
    }>("desktop://workspace-progress", (event) => {
      setSession({ status: event.payload.status, root: event.payload.root })
    })
    return () => {
      void unlisten.then((dispose) => dispose())
    }
  }, [])

  useLayoutEffect(() => {
    return watchDesktopTheme({
      runtimeOrigin,
      snapshot: snapshot.canvasTheme,
    })
  }, [runtimeOrigin, snapshot.canvasTheme])

  useEffect(() => {
    if (session.status !== "ready") {
      return
    }

    if (!runtimeOrigin) {
      return
    }

    const expectedOrigin = runtimeOrigin
    const persistPendingTheme = () => {
      if (!pendingThemeRef.current) {
        return
      }
      void desktopApi.saveCanvasTheme(pendingThemeRef.current).catch(() => {})
      pendingThemeRef.current = null
      themeSaveTimerRef.current = null
    }
    const handleMessage = (event: MessageEvent<unknown>) => {
      const navigationSnapshot = readTrustedDesktopNavigationSnapshot({
        event,
        expectedOrigin,
        expectedSource: runtimeFrameRef.current?.contentWindow ?? null,
      })
      if (navigationSnapshot) {
        setCanvasNavigation(navigationSnapshot)
        return
      }

      const titleRenameResult = readTrustedDesktopArtifactTitleRenameResult({
        event,
        expectedOrigin,
        expectedSource: runtimeFrameRef.current?.contentWindow ?? null,
      })
      if (titleRenameResult) {
        setArtifactTitleRenameResult(titleRenameResult)
        return
      }

      const themeRequest = readTrustedDesktopThemeRequest({
        event,
        expectedOrigin,
        expectedSource: runtimeFrameRef.current?.contentWindow ?? null,
      })
      if (themeRequest) {
        runtimeFrameRef.current?.contentWindow?.postMessage(
          createCanvasThemeBootstrapMessage({
            requestId: themeRequest.requestId,
            snapshot: canvasThemeRef.current,
          }),
          expectedOrigin
        )
        return
      }

      const canvasTheme = readTrustedDesktopThemeMessage({
        event,
        expectedOrigin,
        expectedSource: runtimeFrameRef.current?.contentWindow ?? null,
      })
      if (!canvasTheme) {
        return
      }

      setSnapshot((current) => ({ ...current, canvasTheme }))
      pendingThemeRef.current = canvasTheme
      if (themeSaveTimerRef.current !== null) {
        window.clearTimeout(themeSaveTimerRef.current)
      }
      themeSaveTimerRef.current = window.setTimeout(persistPendingTheme, 250)
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
      if (themeSaveTimerRef.current !== null) {
        window.clearTimeout(themeSaveTimerRef.current)
        persistPendingTheme()
      }
    }
  }, [runtimeOrigin, session])

  useEffect(() => {
    document.documentElement.lang = snapshot.preferences.language
  }, [snapshot.preferences.language])

  useEffect(() => {
    if (!runtimeOrigin) {
      return
    }

    const targetOrigin = runtimeOrigin
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isArtifactSearchShortcut(event)) {
        return
      }

      event.preventDefault()
      runtimeFrameRef.current?.contentWindow?.postMessage(
        createCanvasNavigationCommandMessage({
          type: "open-artifact-search",
        }),
        targetOrigin
      )
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [runtimeOrigin])

  const activeRoot = "root" in session ? session.root : undefined
  const title = useMemo(
    () => activeRoot?.split(/[\\/]/).filter(Boolean).at(-1) ?? "AHTML",
    [activeRoot]
  )

  function postCanvasNavigationCommand(command: CanvasNavigationCommand) {
    if (!runtimeOrigin) {
      return
    }
    runtimeFrameRef.current?.contentWindow?.postMessage(
      createCanvasNavigationCommandMessage(command),
      runtimeOrigin
    )
  }

  function requestCanvasNavigationSnapshot() {
    if (!runtimeOrigin) {
      return
    }
    setCanvasNavigation(null)
    setArtifactTitleRenameResult(null)
    runtimeFrameRef.current?.contentWindow?.postMessage(
      createCanvasNavigationRequestMessage(crypto.randomUUID()),
      runtimeOrigin
    )
  }

  async function openWorkspace(
    path: string,
    initialize = false,
    pendingAction: PendingWorkspaceAction = initialize ? "create" : "open"
  ) {
    setPendingWorkspaceAction(pendingAction)
    setCanvasNavigation(null)
    setSession({ status: initialize ? "initializing" : "opening", root: path })
    try {
      const runtime = await desktopApi.openWorkspace({
        initialize,
        path,
        pipeline: snapshot.preferences.pipeline,
      })
      const nextSnapshot = normalizeDesktopSnapshot(await desktopApi.snapshot())
      setSnapshot(nextSnapshot)
      setSession(readySession(runtime))
    } catch (error) {
      setSession({ status: "failed", root: path, error: workspaceError(error) })
    } finally {
      setPendingWorkspaceAction(null)
    }
  }

  async function chooseWorkspace(initialize: boolean) {
    const path = await selectWorkspaceFolder()
    if (path) {
      await openWorkspace(path, initialize, initialize ? "create" : "open")
    }
  }

  if (session.status === "ready") {
    return (
      <DesktopShell
        navigation={canvasNavigation}
        artifactTitleRenameResult={artifactTitleRenameResult}
        themeMode={snapshot.canvasTheme?.mode ?? "system"}
        onCreateArtifact={() =>
          postCanvasNavigationCommand({ type: "create-artifact" })
        }
        onCloseCodexThreadManager={() =>
          postCanvasNavigationCommand({ type: "close-codex-thread-manager" })
        }
        onOpenCodexThreadManager={() =>
          postCanvasNavigationCommand({ type: "open-codex-thread-manager" })
        }
        onRequestDeleteArtifact={(filePath) =>
          postCanvasNavigationCommand({
            filePath,
            type: "request-delete-artifact",
          })
        }
        onRenameArtifactTitle={({ filePath, requestId, title }) =>
          postCanvasNavigationCommand({
            filePath,
            requestId,
            title,
            type: "rename-artifact-title",
          })
        }
        onSearchArtifacts={() =>
          postCanvasNavigationCommand({ type: "open-artifact-search" })
        }
        onSelectLanguage={(language) =>
          postCanvasNavigationCommand({ language, type: "set-language" })
        }
        onSelectThemeMode={(mode) =>
          postCanvasNavigationCommand({ mode, type: "set-theme-mode" })
        }
        onSelectArtifact={(filePath) =>
          postCanvasNavigationCommand({ filePath, type: "select-artifact" })
        }
        onSelectCanvas={(filePath) =>
          postCanvasNavigationCommand({ filePath, type: "select-canvas" })
        }
        onSetSidebarOpen={(open) =>
          postCanvasNavigationCommand({ open, type: "set-sidebar-open" })
        }
      >
        <main className="desktop-runtime">
          <iframe
            className="desktop-runtime__canvas"
            onLoad={requestCanvasNavigationSnapshot}
            ref={runtimeFrameRef}
            src={session.bootstrapUrl}
            title={`${title} Canvas`}
          />
        </main>
      </DesktopShell>
    )
  }

  return (
    <DesktopShell>
      <main className="desktop-home">
        <div className="desktop-home__content">
          <header className="desktop-home__heading">
            <h1 className="desktop-home__brand">
              <AgentHtmlGhostIcon aria-hidden="true" />
              <span>{agentHtmlBrandName}</span>
            </h1>
            <p>
              Open or create an <code>agent-html/</code> workspace.
            </p>
          </header>

          <section aria-label="Workspace" className="desktop-section">
            <div className="desktop-actions">
              <Button
                aria-busy={pendingWorkspaceAction === "open"}
                disabled={busy}
                intent="primary"
                onClick={() => chooseWorkspace(false)}
              >
                <span aria-hidden="true" className="desktop-button__icon-slot">
                  {pendingWorkspaceAction === "open" ? (
                    <LoaderCircle className="desktop-spinner" />
                  ) : (
                    <FolderOpen />
                  )}
                </span>
                Open project
              </Button>
              <Button
                aria-busy={pendingWorkspaceAction === "create"}
                disabled={busy}
                onClick={() => chooseWorkspace(true)}
              >
                <span aria-hidden="true" className="desktop-button__icon-slot">
                  {pendingWorkspaceAction === "create" ? (
                    <LoaderCircle className="desktop-spinner" />
                  ) : (
                    <Plus />
                  )}
                </span>
                Create workspace
              </Button>
            </div>
            {session.status === "failed" && (
              <div className="desktop-recovery" role="alert">
                <Status kind="error">{session.error.message}</Status>
                <p>
                  Check access to the selected project, then retry or initialize
                  its Canvas workspace.
                </p>
                <div className="desktop-actions">
                  {session.root && session.error.recoverable && (
                    <Button
                      aria-busy={pendingWorkspaceAction === "open"}
                      intent="primary"
                      onClick={() =>
                        openWorkspace(session.root!, false, "open")
                      }
                    >
                      <span
                        aria-hidden="true"
                        className="desktop-button__icon-slot"
                      >
                        {pendingWorkspaceAction === "open" ? (
                          <LoaderCircle className="desktop-spinner" />
                        ) : (
                          <RotateCcw />
                        )}
                      </span>
                      Retry
                    </Button>
                  )}
                  {session.error.code === "missing-workspace" &&
                    session.root && (
                      <Button
                        aria-busy={pendingWorkspaceAction === "create"}
                        onClick={() =>
                          openWorkspace(session.root!, true, "create")
                        }
                      >
                        <span
                          aria-hidden="true"
                          className="desktop-button__icon-slot"
                        >
                          {pendingWorkspaceAction === "create" ? (
                            <LoaderCircle className="desktop-spinner" />
                          ) : (
                            <Plus />
                          )}
                        </span>
                        Initialize agent-html/
                      </Button>
                    )}
                </div>
              </div>
            )}
          </section>

          {snapshot.recents.length > 0 && (
            <section
              aria-labelledby="recent-workspaces"
              className="desktop-section"
            >
              <h2 id="recent-workspaces">Recent</h2>
              <ul className="desktop-recents">
                {snapshot.recents.map((workspace) => (
                  <li key={workspace.path}>
                    <Button
                      aria-busy={
                        typeof pendingWorkspaceAction === "object" &&
                        pendingWorkspaceAction !== null &&
                        pendingWorkspaceAction.type === "recent" &&
                        pendingWorkspaceAction.path === workspace.path
                      }
                      aria-describedby={
                        workspace.available
                          ? undefined
                          : `missing-${workspace.path}`
                      }
                      disabled={!workspace.available || busy}
                      onClick={() =>
                        openWorkspace(workspace.path, false, {
                          path: workspace.path,
                          type: "recent",
                        })
                      }
                    >
                      <span>
                        <strong>{workspace.name}</strong>
                        <small>{workspace.path}</small>
                      </span>
                      <span className="desktop-button__trailing-slot">
                        {typeof pendingWorkspaceAction === "object" &&
                        pendingWorkspaceAction !== null &&
                        pendingWorkspaceAction.type === "recent" &&
                        pendingWorkspaceAction.path === workspace.path ? (
                          <LoaderCircle
                            aria-hidden="true"
                            className="desktop-spinner"
                          />
                        ) : !workspace.available ? (
                          <small id={`missing-${workspace.path}`}>
                            Missing
                          </small>
                        ) : null}
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </DesktopShell>
  )
}

function DesktopShell({
  children,
  artifactTitleRenameResult,
  navigation,
  onCreateArtifact,
  onCloseCodexThreadManager,
  onOpenCodexThreadManager,
  onRequestDeleteArtifact,
  onRenameArtifactTitle,
  onSearchArtifacts,
  onSelectLanguage,
  onSelectArtifact,
  onSelectCanvas,
  onSelectThemeMode,
  onSetSidebarOpen,
  themeMode,
}: {
  children: React.ReactNode
  artifactTitleRenameResult?: ArtifactTitleRenameResult | null
  navigation?: CanvasNavigationSnapshot | null
  onCreateArtifact?: () => void
  onCloseCodexThreadManager?: () => void
  onOpenCodexThreadManager?: () => void
  onRequestDeleteArtifact?: (filePath: string) => void
  onRenameArtifactTitle?: (input: {
    filePath: string
    requestId: string
    title: string
  }) => void
  onSearchArtifacts?: () => void
  onSelectLanguage?: (language: "en" | "system" | "zh") => void
  onSelectArtifact?: (filePath: string) => void
  onSelectCanvas?: (filePath: string) => void
  onSelectThemeMode?: (mode: CanvasThemeMode) => void
  onSetSidebarOpen?: (open: boolean) => void
  themeMode?: CanvasThemeMode
}) {
  return (
    <div className="desktop-shell">
      <DesktopTitleBar
        artifactTitleRenameResult={artifactTitleRenameResult}
        navigation={navigation}
        onCreateArtifact={onCreateArtifact}
        onCloseCodexThreadManager={onCloseCodexThreadManager}
        onOpenCodexThreadManager={onOpenCodexThreadManager}
        onRequestDeleteArtifact={onRequestDeleteArtifact}
        onRenameArtifactTitle={onRenameArtifactTitle}
        onSearchArtifacts={onSearchArtifacts}
        onSelectLanguage={onSelectLanguage}
        onSelectArtifact={onSelectArtifact}
        onSelectCanvas={onSelectCanvas}
        onSelectThemeMode={onSelectThemeMode}
        onSetSidebarOpen={onSetSidebarOpen}
        themeMode={themeMode}
      />
      {children}
    </div>
  )
}
