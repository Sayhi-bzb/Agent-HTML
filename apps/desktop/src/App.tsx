import { FolderOpen, Plus, RotateCcw, Settings, X } from "lucide-react"
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
import { defaultPreferences, type DesktopPreferences } from "./preferences"
import {
  readySession,
  workspaceError,
  type WorkspaceError,
  type WorkspaceSession,
} from "./session"
import { Button, Field, Status } from "./ui"
import { readTrustedDesktopThemeMessage, watchDesktopTheme } from "./theme"
import { DesktopTitleBar } from "./title-bar"

const emptySnapshot: DesktopSnapshot = {
  canvasTheme: null,
  logPath: "",
  preferences: defaultPreferences,
  recents: [],
  version: "development",
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
  const [settingsOpen, setSettingsOpen] = useState(false)
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

  async function savePreferences(preferences: DesktopPreferences) {
    await desktopApi.savePreferences(preferences)
    setSnapshot((current) => ({ ...current, preferences }))
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
        <Button
          aria-label="Workspace settings"
          className="desktop-home__settings"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings aria-hidden="true" size={17} />
        </Button>

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

        {settingsOpen && (
          <SettingsDialog
            close={() => setSettingsOpen(false)}
            preferences={snapshot.preferences}
            save={savePreferences}
            snapshot={snapshot}
          />
        )}
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

function SettingsDialog({
  close,
  preferences,
  save,
  snapshot,
}: {
  close: () => void
  preferences: DesktopPreferences
  save: (preferences: DesktopPreferences) => Promise<void>
  snapshot: DesktopSnapshot
}) {
  const [draft, setDraft] = useState(preferences)
  const [saveError, setSaveError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => {
      if (dialog?.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      aria-labelledby="desktop-settings-title"
      className="desktop-dialog"
      onCancel={(event) => {
        event.preventDefault()
        close()
      }}
      ref={dialogRef}
    >
      <section aria-labelledby="desktop-settings-title">
        <header>
          <div>
            <p className="desktop-eyebrow">AHTML {snapshot.version}</p>
            <h2 id="desktop-settings-title">Settings</h2>
          </div>
          <Button aria-label="Close settings" autoFocus onClick={close}>
            <X aria-hidden="true" size={16} />
          </Button>
        </header>
        <div className="desktop-settings">
          <Field label="Language">
            <select
              value={draft.language}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  language: event.target.value as "en" | "zh-CN",
                })
              }
            >
              <option value="en">English</option>
              <option value="zh-CN">简体中文</option>
            </select>
          </Field>
          <Field label="Agent pipeline">
            <select
              value={draft.pipeline}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  pipeline: event.target
                    .value as DesktopPreferences["pipeline"],
                })
              }
            >
              <option value="codex">Codex</option>
              <option value="example">Example (offline)</option>
            </select>
          </Field>
          <Field label="External editor command">
            <input
              placeholder="code"
              value={draft.externalEditor}
              onChange={(event) =>
                setDraft({ ...draft, externalEditor: event.target.value })
              }
            />
          </Field>
          <label className="desktop-checkbox">
            <input
              checked={draft.automaticUpdates}
              disabled
              readOnly
              type="checkbox"
            />
            Automatic updates require a signed release channel
          </label>
          <p className="desktop-muted">
            Runtime log: {snapshot.logPath || "Not started"}
          </p>
        </div>
        <footer className="desktop-actions">
          <Button onClick={() => desktopApi.showLog()}>Open log</Button>
          <Button
            intent="primary"
            onClick={async () => {
              setSaveError(null)
              try {
                await save(draft)
                close()
              } catch (error) {
                setSaveError(
                  error instanceof Error ? error.message : String(error)
                )
              }
            }}
          >
            Save
          </Button>
        </footer>
        {saveError && <Status kind="error">{saveError}</Status>}
      </section>
    </dialog>
  )
}
