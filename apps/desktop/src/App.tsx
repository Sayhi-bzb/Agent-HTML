import {
  FolderOpen,
  Plus,
  RotateCcw,
  Settings,
  X,
} from "lucide-react"
import { listen } from "@tauri-apps/api/event"
import { useEffect, useMemo, useRef, useState } from "react"

import {
  desktopApi,
  selectWorkspaceFolder,
  type DesktopSnapshot,
} from "./desktop-api"
import {
  defaultPreferences,
  type DesktopPreferences,
} from "./preferences"
import {
  readySession,
  workspaceError,
  type WorkspaceSession,
} from "./session"
import { Button, Field, Status } from "./ui"

const emptySnapshot: DesktopSnapshot = {
  logPath: "",
  preferences: defaultPreferences,
  recents: [],
  version: "development",
}

export default function App() {
  const [snapshot, setSnapshot] = useState(emptySnapshot)
  const [session, setSession] = useState<WorkspaceSession>({ status: "idle" })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const busy = ["opening", "initializing", "starting", "closing"].includes(
    session.status
  )

  useEffect(() => {
    desktopApi.snapshot().then(setSnapshot).catch(() => {})
  }, [])

  useEffect(() => {
    const unlisten = listen<string>("desktop://runtime-crashed", (event) => {
      setSession((current) => ({
        status: "failed",
        root: "root" in current ? current.root : undefined,
        error: {
          code: "runtime-crashed",
          message: event.payload,
          recoverable: true,
        },
      }))
    })
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

  useEffect(() => {
    document.documentElement.dataset.theme = snapshot.preferences.theme
    document.documentElement.lang = snapshot.preferences.language
  }, [snapshot.preferences])

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
      setSnapshot(await desktopApi.snapshot())
    } catch (error) {
      setSession({ status: "failed", root: path, error: workspaceError(error) })
    }
  }

  async function chooseWorkspace(initialize: boolean) {
    const path = await selectWorkspaceFolder()
    if (path) await openWorkspace(path, initialize)
  }

  async function closeWorkspace() {
    if (!activeRoot) return
    setSession({ status: "closing", root: activeRoot })
    try {
      await desktopApi.closeWorkspace()
      setSession({ status: "idle" })
    } catch (error) {
      setSession({
        status: "failed",
        root: activeRoot,
        error: workspaceError(error),
      })
    }
  }

  async function savePreferences(preferences: DesktopPreferences) {
    await desktopApi.savePreferences(preferences)
    setSnapshot((current) => ({ ...current, preferences }))
  }

  if (session.status === "ready") {
    return (
      <main className="desktop-runtime">
        <header className="desktop-runtime__bar">
          <div>
            <strong>{title}</strong>
            <Status kind="success">Runtime ready</Status>
          </div>
          <div className="desktop-actions">
            <Button
              aria-label="Workspace settings"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings aria-hidden="true" size={16} />
              Settings
            </Button>
            <Button onClick={closeWorkspace}>
              <X aria-hidden="true" size={16} />
              Switch workspace
            </Button>
          </div>
        </header>
        <iframe
          className="desktop-runtime__canvas"
          src={session.bootstrapUrl}
          title={`${title} Canvas`}
        />
        {settingsOpen && (
          <SettingsDialog
            close={() => setSettingsOpen(false)}
            preferences={snapshot.preferences}
            save={savePreferences}
            snapshot={snapshot}
          />
        )}
      </main>
    )
  }

  return (
    <main className="desktop-home">
      <header className="desktop-home__heading">
        <p className="desktop-eyebrow">Artifact workbench</p>
        <h1>Open a project. Shape the artifact.</h1>
        <p>
          AHTML connects the project&apos;s <code>agent-html/</code> workspace
          to a supervised local Canvas runtime.
        </p>
      </header>

      <section aria-labelledby="workspace-actions" className="desktop-section">
        <h2 id="workspace-actions">Workspace</h2>
        <div className="desktop-actions">
          <Button
            disabled={busy}
            intent="primary"
            onClick={() => chooseWorkspace(false)}
          >
            <FolderOpen aria-hidden="true" size={17} />
            Open folder
          </Button>
          <Button disabled={busy} onClick={() => chooseWorkspace(true)}>
            <Plus aria-hidden="true" size={17} />
            Create workspace
          </Button>
          <Button onClick={() => setSettingsOpen(true)}>
            <Settings aria-hidden="true" size={17} />
            Settings
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
              {session.error.code === "missing-workspace" && session.root && (
                <Button onClick={() => openWorkspace(session.root!, true)}>
                  Initialize agent-html/
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="recent-workspaces" className="desktop-section">
        <h2 id="recent-workspaces">Recent projects</h2>
        {snapshot.recents.length === 0 ? (
          <p className="desktop-muted">No recent projects yet.</p>
        ) : (
          <ul className="desktop-recents">
            {snapshot.recents.map((workspace) => (
              <li key={workspace.path}>
                <Button
                  aria-describedby={
                    workspace.available ? undefined : `missing-${workspace.path}`
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
        )}
      </section>

      {settingsOpen && (
        <SettingsDialog
          close={() => setSettingsOpen(false)}
          preferences={snapshot.preferences}
          save={savePreferences}
          snapshot={snapshot}
        />
      )}
    </main>
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
                setDraft({ ...draft, language: event.target.value as "en" | "zh-CN" })
              }
            >
              <option value="en">English</option>
              <option value="zh-CN">简体中文</option>
            </select>
          </Field>
          <Field label="Theme">
            <select
              value={draft.theme}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  theme: event.target.value as DesktopPreferences["theme"],
                })
              }
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </Field>
          <Field label="Agent pipeline">
            <select
              value={draft.pipeline}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  pipeline: event.target.value as DesktopPreferences["pipeline"],
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
          <p className="desktop-muted">Runtime log: {snapshot.logPath || "Not started"}</p>
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
