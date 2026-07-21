import { FolderOpen, Plus, RotateCcw } from "lucide-react"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  readCanvasThemeSnapshot,
  type CanvasThemeSnapshot,
} from "../../../packages/cli/src/host/theme/theme-sync-contract"

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
import { readTrustedDesktopThemeMessage, watchDesktopTheme } from "./theme"
import { DesktopTitleBar } from "./title-bar"

const emptySnapshot: DesktopSnapshot = {
  canvasTheme: null,
  preferences: defaultPreferences,
  recents: [],
}

function normalizeDesktopSnapshot(snapshot: DesktopSnapshot): DesktopSnapshot {
  return {
    ...snapshot,
    canvasTheme: readCanvasThemeSnapshot(snapshot.canvasTheme),
  }
}

export default function App() {
  const [snapshot, setSnapshot] = useState(emptySnapshot)
  const [session, setSession] = useState<WorkspaceSession>({ status: "idle" })
  const runtimeFrameRef = useRef<HTMLIFrameElement>(null)
  const themeSaveTimerRef = useRef<number | null>(null)
  const pendingThemeRef = useRef<CanvasThemeSnapshot | null>(null)
  const busy = ["opening", "initializing", "starting", "closing"].includes(
    session.status
  )

  useEffect(() => {
    desktopApi
      .snapshot()
      .then((nextSnapshot) => setSnapshot(normalizeDesktopSnapshot(nextSnapshot)))
      .catch(() => {})
  }, [])

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
    return watchDesktopTheme({ snapshot: snapshot.canvasTheme })
  }, [snapshot.canvasTheme])

  useEffect(() => {
    if (session.status !== "ready") {
      return
    }

    const expectedOrigin = new URL(session.bootstrapUrl).origin
    const persistPendingTheme = () => {
      if (!pendingThemeRef.current) {
        return
      }
      void desktopApi.saveCanvasTheme(pendingThemeRef.current).catch(() => {})
      pendingThemeRef.current = null
      themeSaveTimerRef.current = null
    }
    const handleMessage = (event: MessageEvent<unknown>) => {
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
  }, [session])

  useEffect(() => {
    document.documentElement.lang = snapshot.preferences.language
  }, [snapshot.preferences.language])

  const activeRoot = "root" in session ? session.root : undefined
  const title = useMemo(
    () => activeRoot?.split(/[\\/]/).filter(Boolean).at(-1) ?? "AHTML",
    [activeRoot]
  )

  async function openWorkspace(path: string, initialize = false) {
    setSession({ status: initialize ? "initializing" : "opening", root: path })
    try {
      const runtime = await desktopApi.openWorkspace({
        initialize,
        path,
        pipeline: snapshot.preferences.pipeline,
      })
      setSession(readySession(runtime))
      setSnapshot(normalizeDesktopSnapshot(await desktopApi.snapshot()))
    } catch (error) {
      setSession({ status: "failed", root: path, error: workspaceError(error) })
    }
  }

  async function chooseWorkspace(initialize: boolean) {
    const path = await selectWorkspaceFolder()
    if (path) await openWorkspace(path, initialize)
  }

  if (session.status === "ready") {
    return (
      <DesktopShell>
        <main className="desktop-runtime">
          <iframe
            className="desktop-runtime__canvas"
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
            <h1>AHTML</h1>
            <p>
              Open or create an <code>agent-html/</code> workspace.
            </p>
          </header>

          <section aria-label="Workspace" className="desktop-section">
            <div className="desktop-actions">
              <Button
                disabled={busy}
                intent="primary"
                onClick={() => chooseWorkspace(false)}
              >
                <FolderOpen aria-hidden="true" size={17} />
                Open project
              </Button>
              <Button disabled={busy} onClick={() => chooseWorkspace(true)}>
                <Plus aria-hidden="true" size={17} />
                Create workspace
              </Button>
            </div>
            {busy && <Status>Preparing {title}…</Status>}
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
                      intent="primary"
                      onClick={() => openWorkspace(session.root!)}
                    >
                      <RotateCcw aria-hidden="true" size={16} />
                      Retry
                    </Button>
                  )}
                  {session.error.code === "missing-workspace" &&
                    session.root && (
                      <Button
                        onClick={() => openWorkspace(session.root!, true)}
                      >
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
                      aria-describedby={
                        workspace.available
                          ? undefined
                          : `missing-${workspace.path}`
                      }
                      disabled={!workspace.available || busy}
                      onClick={() => openWorkspace(workspace.path)}
                    >
                      <span>
                        <strong>{workspace.name}</strong>
                        <small>{workspace.path}</small>
                      </span>
                      {!workspace.available && (
                        <small id={`missing-${workspace.path}`}>Missing</small>
                      )}
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

function DesktopShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="desktop-shell">
      <DesktopTitleBar />
      {children}
    </div>
  )
}
