import {
  BookOpenText,
  ChevronRight,
  Copy,
  Languages,
  MessageSquareText,
  Minus,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Square,
  X,
} from "lucide-react"
import { ContextMenu, DropdownMenu, Popover } from "radix-ui"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type WheelEvent,
} from "react"

import { AgentHtmlGhostIcon } from "../../../packages/cli/src/shared/brand-icons"
import { GithubMarkIcon } from "../../../packages/cli/src/host/ui/brand-icons"
import type {
  ArtifactTitleRenameResult,
  CanvasNavigationLanguage,
  CanvasNavigationSnapshot,
} from "../../../packages/cli/src/host/navigation/navigation-sync-contract"
import type { CanvasThemeMode } from "../../../packages/cli/src/host/theme/theme-sync-contract"
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

function AgentMenuButton({
  activeCodexThreadLabel,
  activeLanguage,
  align,
  className,
  onSearchArtifacts,
  onOpenCodexThreadManager,
  onSelectLanguage,
  onSelectThemeMode,
  themeMode,
}: {
  activeCodexThreadLabel?: string | null
  activeLanguage?: CanvasNavigationLanguage
  align: "start" | "end"
  className: string
  onSearchArtifacts?: () => void
  onOpenCodexThreadManager?: () => void
  onSelectLanguage?: (language: CanvasNavigationLanguage) => void
  onSelectThemeMode?: (mode: CanvasThemeMode) => void
  themeMode?: CanvasThemeMode
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Agent menu"
          className={className}
          title="Agent menu"
          type="button"
        >
          <AgentHtmlGhostIcon aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          aria-label="Agent menu"
          className="desktop-titlebar__agent-menu-content"
          collisionPadding={8}
          side="bottom"
          sideOffset={6}
        >
          <DropdownMenu.Item
            aria-keyshortcuts="Meta+K Control+K"
            className="desktop-titlebar__agent-menu-item"
            disabled={!onSearchArtifacts}
            onSelect={onSearchArtifacts}
          >
            <Search aria-hidden="true" />
            <span>Search</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="desktop-titlebar__agent-menu-separator" />
          <DropdownMenu.Item
            className="desktop-titlebar__agent-menu-item"
            disabled={!onOpenCodexThreadManager}
            onSelect={onOpenCodexThreadManager}
            title={activeCodexThreadLabel ?? "New thread"}
          >
            <MessageSquareText aria-hidden="true" />
            <span className="desktop-titlebar__agent-menu-label">
              {activeCodexThreadLabel ?? "New thread"}
            </span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="desktop-titlebar__agent-menu-separator" />
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger
              className="desktop-titlebar__agent-menu-item"
              disabled={!onSelectThemeMode}
            >
              <Moon aria-hidden="true" />
              <span>Theme</span>
              <ChevronRight
                aria-hidden="true"
                className="desktop-titlebar__agent-menu-chevron"
              />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                aria-label="Theme"
                className="desktop-titlebar__agent-menu-subcontent"
                collisionPadding={8}
                sideOffset={6}
              >
                <DropdownMenu.RadioGroup
                  onValueChange={(mode) =>
                    onSelectThemeMode?.(mode as CanvasThemeMode)
                  }
                  value={themeMode ?? "system"}
                >
                  {(
                    [
                      ["system", "System"],
                      ["light", "Light"],
                      ["dark", "Dark"],
                    ] as const satisfies readonly (readonly [
                      CanvasThemeMode,
                      string,
                    ])[]
                  ).map(([mode, label]) => (
                    <DropdownMenu.RadioItem
                      className="desktop-titlebar__agent-menu-item desktop-titlebar__agent-menu-radio-item"
                      key={mode}
                      value={mode}
                    >
                      <span>{label}</span>
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger
              className="desktop-titlebar__agent-menu-item"
              disabled={!activeLanguage || !onSelectLanguage}
            >
              <Languages aria-hidden="true" />
              <span>Language</span>
              <ChevronRight
                aria-hidden="true"
                className="desktop-titlebar__agent-menu-chevron"
              />
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                aria-label="Language"
                className="desktop-titlebar__agent-menu-subcontent"
                collisionPadding={8}
                sideOffset={6}
              >
                <DropdownMenu.RadioGroup
                  onValueChange={(language) =>
                    onSelectLanguage?.(language as CanvasNavigationLanguage)
                  }
                  value={activeLanguage ?? "system"}
                >
                  {(
                    [
                      ["system", "System"],
                      ["zh", "中文"],
                      ["en", "English"],
                    ] as const satisfies readonly (readonly [
                      CanvasNavigationLanguage,
                      string,
                    ])[]
                  ).map(([language, label]) => (
                    <DropdownMenu.RadioItem
                      className="desktop-titlebar__agent-menu-item desktop-titlebar__agent-menu-radio-item"
                      key={language}
                      value={language}
                    >
                      <span>{label}</span>
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Item
            asChild
            className="desktop-titlebar__agent-menu-item"
          >
            <a
              href="https://agent-html.org/docs"
              rel="noreferrer"
              target="_blank"
            >
              <BookOpenText aria-hidden="true" />
              <span>Documentation</span>
            </a>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            asChild
            className="desktop-titlebar__agent-menu-item"
          >
            <a
              href="https://github.com/Sayhi-bzb/Agent-HTML"
              rel="noreferrer"
              target="_blank"
            >
              <GithubMarkIcon aria-hidden="true" />
              <span>GitHub</span>
            </a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
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
  onCloseCodexThreadManager = () => {},
  onCreateArtifact = () => {},
  onOpenCodexThreadManager,
  onRequestDeleteArtifact = () => {},
  onRenameArtifactTitle = () => {},
  onSearchArtifacts,
  onSelectLanguage,
  onSelectArtifact = () => {},
  onSelectCanvas = () => {},
  onSelectThemeMode,
  onSetSidebarOpen = () => {},
  platform = readDesktopPlatform(),
  themeMode,
  windowControls,
}: {
  artifactTitleRenameResult?: ArtifactTitleRenameResult | null
  navigation?: CanvasNavigationSnapshot | null
  onCloseCodexThreadManager?: () => void
  onCreateArtifact?: () => void
  onOpenCodexThreadManager?: () => void
  onRequestDeleteArtifact?: (filePath: string) => void
  onRenameArtifactTitle?: (input: {
    filePath: string
    requestId: string
    title: string
  }) => void
  onSearchArtifacts?: () => void
  onSelectLanguage?: (language: CanvasNavigationLanguage) => void
  onSelectArtifact?: (filePath: string) => void
  onSelectCanvas?: (filePath: string) => void
  onSelectThemeMode?: (mode: CanvasThemeMode) => void
  onSetSidebarOpen?: (open: boolean) => void
  platform?: DesktopPlatform
  themeMode?: CanvasThemeMode
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
  }, [
    navigation?.activeFilePath,
    navigation?.codexThreadManagerActive,
    navigation?.createArtifactActive,
  ])

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
      data-navigation={showsWorkspaceNavigation ? "workspace" : "home"}
      data-platform={platform}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleDragStart}
    >
      {showsWorkspaceNavigation ? (
        <nav aria-label="Workspace" className="desktop-titlebar__navigation">
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
            aria-busy={
              (navigation?.artifactsLoading ?? true) ||
              (navigation?.canvasesLoading ?? false)
            }
            className="desktop-titlebar__artifacts"
            onWheel={handleArtifactWheel}
          >
            {navigation?.artifacts.map((artifact) => {
              const active =
                !navigation.createArtifactActive &&
                !navigation.codexThreadManagerActive &&
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
            {navigation?.canvases?.map((canvas) => {
              const active =
                !navigation.createArtifactActive &&
                !navigation.codexThreadManagerActive &&
                canvas.filePath === navigation.activeFilePath
              return (
                <div
                  className="desktop-titlebar__artifact"
                  data-active={active ? "" : undefined}
                  data-kind="canvas"
                  key={canvas.filePath}
                >
                  <button
                    aria-current={active ? "page" : undefined}
                    className="desktop-titlebar__artifact-label"
                    onClick={() => onSelectCanvas(canvas.filePath)}
                    ref={active ? activeArtifactRef : undefined}
                    title={canvas.title}
                    type="button"
                  >
                    <span className="desktop-titlebar__artifact-title">
                      {canvas.title}
                    </span>
                  </button>
                </div>
              )
            })}
            {navigation?.codexThreadManagerActive ? (
              <div
                className="desktop-titlebar__artifact"
                data-active=""
                data-kind="threads"
              >
                <button
                  aria-current="page"
                  className="desktop-titlebar__artifact-label"
                  ref={activeArtifactRef}
                  title="Threads"
                  type="button"
                >
                  <span className="desktop-titlebar__artifact-title">
                    Threads
                  </span>
                </button>
                <button
                  aria-label="Close Threads"
                  className="desktop-titlebar__thread-close"
                  onClick={onCloseCodexThreadManager}
                  title="Close Threads"
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            ) : null}
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
      ) : null}
      <div aria-hidden="true" className="desktop-titlebar__drag-space" />
      {showsWorkspaceNavigation && (
        <AgentMenuButton
          activeCodexThreadLabel={navigation?.activeCodexThreadLabel}
          activeLanguage={navigation?.activeLanguage}
          align="end"
          className="desktop-titlebar__brand desktop-titlebar__brand--compact desktop-titlebar__navigation-action desktop-titlebar__agent-menu-trigger"
          onSearchArtifacts={onSearchArtifacts}
          onOpenCodexThreadManager={onOpenCodexThreadManager}
          onSelectLanguage={onSelectLanguage}
          onSelectThemeMode={onSelectThemeMode}
          themeMode={themeMode}
        />
      )}
      <div className="desktop-titlebar__controls">{windowActions}</div>
    </header>
  )
}
