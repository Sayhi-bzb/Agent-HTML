import { Copy, Minus, PanelLeft, Plus, Square, X } from "lucide-react"
import { ContextMenu, Popover } from "radix-ui"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type WheelEvent,
} from "react"

import { agentHtmlBrandName } from "../../../packages/cli/src/shared/brand"
import { AgentHtmlGhostIcon } from "../../../packages/cli/src/shared/brand-icons"
import type {
  ArtifactTitleRenameResult,
  CanvasNavigationSnapshot,
} from "../../../packages/cli/src/host/navigation/navigation-sync-contract"
import {
  createDesktopWindowControls,
  resolveDesktopPlatform,
  type DesktopPlatform,
  type DesktopWindowControls,
} from "./desktop-window"

function readDesktopPlatform() {
  if (typeof navigator === "undefined") return "windows"
  return resolveDesktopPlatform(`${navigator.platform} ${navigator.userAgent}`)
}

function runWindowAction(action: () => Promise<void>) {
  void action().catch(() => {})
}

const artifactTitleRenameTimeoutMs = 10_000

type ArtifactTitleEditor = {
  attempted: boolean
  draft: string
  error: string | null
  filePath: string
  pending: boolean
  requestId: string | null
  submittedTitle: string | null
}

function WindowControl({
  action,
  children,
  kind,
  label,
}: {
  action: () => Promise<void>
  children: React.ReactNode
  kind: "close" | "standard"
  label: string
}) {
  return (
    <button
      aria-label={label}
      className="desktop-titlebar__control"
      data-kind={kind}
      onClick={() => runWindowAction(action)}
      title={label}
      type="button"
    >
      {children}
    </button>
  )
}

export function DesktopTitleBar({
  artifactTitleRenameResult,
  navigation,
  onCreateArtifact = () => {},
  onRequestDeleteArtifact = () => {},
  onRenameArtifactTitle = () => {},
  onSelectArtifact = () => {},
  onSetSidebarOpen = () => {},
  platform = readDesktopPlatform(),
  windowControls,
}: {
  artifactTitleRenameResult?: ArtifactTitleRenameResult | null
  navigation?: CanvasNavigationSnapshot | null
  onCreateArtifact?: () => void
  onRequestDeleteArtifact?: (filePath: string) => void
  onRenameArtifactTitle?: (input: {
    filePath: string
    requestId: string
    title: string
  }) => void
  onSelectArtifact?: (filePath: string) => void
  onSetSidebarOpen?: (open: boolean) => void
  platform?: DesktopPlatform
  windowControls?: DesktopWindowControls
}) {
  const controls = useMemo(
    () => windowControls ?? createDesktopWindowControls(),
    [windowControls]
  )
  const [maximized, setMaximized] = useState(false)
  const [titleEditor, setTitleEditor] = useState<ArtifactTitleEditor | null>(
    null
  )
  const activeArtifactRef = useRef<HTMLButtonElement | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const editingFilePath = titleEditor?.submittedTitle
    ? null
    : titleEditor?.filePath
  const showsWorkspaceNavigation = navigation !== undefined

  useEffect(() => {
    let active = true
    let dispose: (() => void) | undefined
    const refresh = () => {
      void controls
        .isMaximized()
        .then((value) => {
          if (active) setMaximized(value)
        })
        .catch(() => {})
    }

    refresh()
    void controls
      .onResized(refresh)
      .then((nextDispose) => {
        if (active) dispose = nextDispose
        else nextDispose()
      })
      .catch(() => {})

    return () => {
      active = false
      dispose?.()
    }
  }, [controls])

  useEffect(() => {
    activeArtifactRef.current?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    })
  }, [navigation?.activeFilePath, navigation?.createArtifactActive])

  useEffect(() => {
    if (!editingFilePath) return
    titleInputRef.current?.focus()
    titleInputRef.current?.select()
  }, [editingFilePath])

  useEffect(() => {
    if (!artifactTitleRenameResult) return
    // The versioned iframe response is the external completion signal for this editor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitleEditor((current) => {
      if (
        !current ||
        current.filePath !== artifactTitleRenameResult.filePath ||
        current.requestId !== artifactTitleRenameResult.requestId
      ) {
        return current
      }
      if (artifactTitleRenameResult.ok) {
        return {
          ...current,
          draft: artifactTitleRenameResult.title,
          error: null,
          pending: false,
          submittedTitle: artifactTitleRenameResult.title,
        }
      }
      return {
        ...current,
        error: artifactTitleRenameResult.error,
        pending: false,
      }
    })
  }, [artifactTitleRenameResult])

  useEffect(() => {
    // Registry acknowledgement ends the optimistic title handoff.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitleEditor((current) => {
      if (!current?.submittedTitle || !navigation) return current
      const artifact = navigation.artifacts.find(
        (candidate) => candidate.filePath === current.filePath
      )
      return artifact?.title === current.submittedTitle || !artifact
        ? null
        : current
    })
  }, [navigation])

  useEffect(() => {
    if (!titleEditor?.pending || !titleEditor.requestId) return
    const requestId = titleEditor.requestId
    const timeout = window.setTimeout(() => {
      setTitleEditor((current) =>
        current?.pending && current.requestId === requestId
          ? {
              ...current,
              error: "Rename timed out. Try again.",
              pending: false,
            }
          : current
      )
    }, artifactTitleRenameTimeoutMs)
    return () => window.clearTimeout(timeout)
  }, [titleEditor?.pending, titleEditor?.requestId])

  const minimize = (
    <WindowControl
      action={controls.minimize}
      key="minimize"
      kind="standard"
      label="Minimize window"
    >
      <Minus aria-hidden="true" />
    </WindowControl>
  )
  const maximize = (
    <WindowControl
      action={async () => {
        await controls.toggleMaximize()
        setMaximized(await controls.isMaximized())
      }}
      key="maximize"
      kind="standard"
      label={maximized ? "Restore window" : "Maximize window"}
    >
      {maximized ? <Copy aria-hidden="true" /> : <Square aria-hidden="true" />}
    </WindowControl>
  )
  const close = (
    <WindowControl
      action={controls.close}
      key="close"
      kind="close"
      label="Close window"
    >
      <X aria-hidden="true" />
    </WindowControl>
  )
  const windowActions =
    platform === "macos"
      ? [close, minimize, maximize]
      : [minimize, maximize, close]

  const handleDragStart = (event: MouseEvent<HTMLElement>) => {
    if (
      event.button !== 0 ||
      event.detail > 1 ||
      (event.target as HTMLElement).closest("button, input")
    ) {
      return
    }
    runWindowAction(controls.startDragging)
  }
  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button, input")) return
    runWindowAction(controls.toggleMaximize)
  }
  const handleArtifactWheel = (event: WheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return
    }
    event.currentTarget.scrollLeft += event.deltaY
  }

  return (
    <header
      aria-label="Application title bar"
      className="desktop-titlebar"
      data-navigation={showsWorkspaceNavigation ? "workspace" : "brand"}
      data-platform={platform}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleDragStart}
    >
      {showsWorkspaceNavigation ? (
        <nav aria-label="Artifacts" className="desktop-titlebar__navigation">
          <button
            aria-label={
              navigation?.leftSidebarOpen
                ? "Collapse sidebar"
                : "Expand sidebar"
            }
            aria-expanded={navigation?.leftSidebarOpen ?? false}
            className="desktop-titlebar__navigation-action"
            disabled={!navigation}
            onClick={() =>
              onSetSidebarOpen(!(navigation?.leftSidebarOpen ?? false))
            }
            title={
              navigation?.leftSidebarOpen
                ? "Collapse sidebar"
                : "Expand sidebar"
            }
            type="button"
          >
            <PanelLeft aria-hidden="true" />
          </button>
          <div
            aria-busy={navigation?.artifactsLoading ?? true}
            className="desktop-titlebar__artifacts"
            onWheel={handleArtifactWheel}
          >
            {navigation?.artifacts.map((artifact) => {
              const active =
                !navigation.createArtifactActive &&
                artifact.filePath === navigation.activeFilePath
              const editor =
                titleEditor?.filePath === artifact.filePath ? titleEditor : null
              const editing = Boolean(editor && !editor.submittedTitle)
              const displayedTitle = editor?.submittedTitle ?? artifact.title

              const beginRename = () => {
                setTitleEditor({
                  attempted: false,
                  draft: artifact.title,
                  error: null,
                  filePath: artifact.filePath,
                  pending: false,
                  requestId: null,
                  submittedTitle: null,
                })
              }
              const submitRename = () => {
                if (!editor || editor.pending) return
                const title = editor.draft.trim()
                if (!title) {
                  setTitleEditor((current) =>
                    current?.filePath === artifact.filePath
                      ? { ...current, error: "Artifact title is required" }
                      : current
                  )
                  return
                }
                const requestId = crypto.randomUUID()
                setTitleEditor((current) =>
                  current?.filePath === artifact.filePath
                    ? {
                        ...current,
                        attempted: true,
                        draft: title,
                        error: null,
                        pending: true,
                        requestId,
                      }
                    : current
                )
                onRenameArtifactTitle({
                  filePath: artifact.filePath,
                  requestId,
                  title,
                })
              }
              return (
                <ContextMenu.Root key={artifact.filePath}>
                  <ContextMenu.Trigger asChild>
                    <div
                      className="desktop-titlebar__artifact"
                      data-active={active ? "" : undefined}
                      data-editing={editing ? "" : undefined}
                    >
                      {editing && editor ? (
                        <Popover.Root open={Boolean(editor.error)}>
                          <Popover.Anchor asChild>
                            <input
                              aria-busy={editor.pending}
                              aria-describedby={
                                editor.error
                                  ? `artifact-title-error-${artifact.filePath}`
                                  : undefined
                              }
                              aria-invalid={editor.error ? true : undefined}
                              aria-label={`Rename ${artifact.title}`}
                              className="desktop-titlebar__artifact-input"
                              maxLength={512}
                              onBlur={() => {
                                if (!editor.attempted && !editor.pending) {
                                  setTitleEditor(null)
                                }
                              }}
                              onChange={(event) =>
                                setTitleEditor((current) =>
                                  current?.filePath === artifact.filePath
                                    ? {
                                        ...current,
                                        draft: event.target.value,
                                        error: null,
                                      }
                                    : current
                                )
                              }
                              onKeyDown={(event) => {
                                event.stopPropagation()
                                if (event.key === "Enter") {
                                  event.preventDefault()
                                  submitRename()
                                } else if (
                                  event.key === "Escape" &&
                                  !editor.attempted &&
                                  !editor.pending
                                ) {
                                  event.preventDefault()
                                  setTitleEditor(null)
                                }
                              }}
                              readOnly={editor.pending}
                              ref={titleInputRef}
                              value={editor.draft}
                            />
                          </Popover.Anchor>
                          <Popover.Portal>
                            <Popover.Content
                              align="start"
                              className="desktop-titlebar__rename-error"
                              onOpenAutoFocus={(event) =>
                                event.preventDefault()
                              }
                              side="bottom"
                              sideOffset={6}
                            >
                              <span
                                id={`artifact-title-error-${artifact.filePath}`}
                                role="alert"
                              >
                                {editor.error}
                              </span>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      ) : (
                        <button
                          aria-current={active ? "page" : undefined}
                          className="desktop-titlebar__artifact-label"
                          onClick={() => onSelectArtifact(artifact.filePath)}
                          ref={active ? activeArtifactRef : undefined}
                          title={displayedTitle}
                          type="button"
                        >
                          <span className="desktop-titlebar__artifact-title">
                            {displayedTitle}
                          </span>
                        </button>
                      )}
                      {!editing && (
                        <button
                          aria-label={`Delete ${displayedTitle}`}
                          className="desktop-titlebar__artifact-close"
                          onClick={() =>
                            onRequestDeleteArtifact(artifact.filePath)
                          }
                          title={`Delete ${displayedTitle}`}
                          type="button"
                        >
                          <X aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </ContextMenu.Trigger>
                  <ContextMenu.Portal>
                    <ContextMenu.Content
                      className="desktop-titlebar__context-menu"
                      collisionPadding={8}
                      onCloseAutoFocus={(event) => event.preventDefault()}
                    >
                      <ContextMenu.Item
                        className="desktop-titlebar__context-menu-item"
                        onSelect={beginRename}
                      >
                        Rename
                      </ContextMenu.Item>
                    </ContextMenu.Content>
                  </ContextMenu.Portal>
                </ContextMenu.Root>
              )
            })}
            {!navigation && (
              <span
                aria-hidden="true"
                className="desktop-titlebar__artifact-placeholder"
              />
            )}
          </div>
          <button
            aria-label="New Artifact"
            aria-pressed={navigation?.createArtifactActive ?? false}
            className="desktop-titlebar__navigation-action"
            data-active={navigation?.createArtifactActive ? "" : undefined}
            disabled={!navigation}
            onClick={onCreateArtifact}
            title="New Artifact"
            type="button"
          >
            <Plus aria-hidden="true" />
          </button>
        </nav>
      ) : (
        <div className="desktop-titlebar__brand desktop-titlebar__brand--full">
          <AgentHtmlGhostIcon
            aria-hidden="true"
            className="desktop-titlebar__brand-icon"
          />
          <span className="desktop-titlebar__title">{agentHtmlBrandName}</span>
        </div>
      )}
      <div aria-hidden="true" className="desktop-titlebar__drag-space" />
      {showsWorkspaceNavigation && (
        <div
          aria-label={agentHtmlBrandName}
          className="desktop-titlebar__brand desktop-titlebar__brand--compact"
          role="img"
          title={agentHtmlBrandName}
        >
          <AgentHtmlGhostIcon
            aria-hidden="true"
            className="desktop-titlebar__brand-icon"
          />
        </div>
      )}
      <div className="desktop-titlebar__controls">{windowActions}</div>
    </header>
  )
}
