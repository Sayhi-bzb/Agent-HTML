import {
  BookOpenText,
  ChevronRight,
  Copy,
  Languages,
  MessageSquareText,
  Minus,
  Moon,
  Palette,
  Plus,
  Search,
  Square,
  SwatchBook,
  X,
} from "lucide-react"
import { ContextMenu, DropdownMenu, Popover } from "radix-ui"
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type KeyboardEvent,
  type WheelEvent,
} from "react"

import { AgentHtmlGhostIcon } from "../../../packages/cli/src/shared/brand-icons"
import { GithubMarkIcon } from "../../../packages/cli/src/host/ui/brand-icons"
import type {
  ArtifactTitleRenameResult,
  CanvasNavigationLanguage,
  CanvasNavigationSnapshot,
  CanvasNavigationThemePreset,
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
  activeThemePresetId,
  align,
  className,
  onSearchArtifacts,
  onOpenAppearance,
  onOpenCodexThreadManager,
  onSelectLanguage,
  onSelectThemeMode,
  onSelectThemePreset,
  themePresets,
  themeMode,
}: {
  activeCodexThreadLabel?: string | null
  activeLanguage?: CanvasNavigationLanguage
  activeThemePresetId?: CanvasNavigationThemePreset["id"]
  align: "start" | "end"
  className: string
  onSearchArtifacts?: () => void
  onOpenAppearance?: () => void
  onOpenCodexThreadManager?: () => void
  onSelectLanguage?: (language: CanvasNavigationLanguage) => void
  onSelectThemeMode?: (mode: CanvasThemeMode) => void
  onSelectThemePreset?: (
    presetId: CanvasNavigationThemePreset["id"]
  ) => void
  themePresets?: readonly CanvasNavigationThemePreset[]
  themeMode?: CanvasThemeMode
}) {
  const activeThemePreset = themePresets?.find(
    (preset) => preset.id === activeThemePresetId
  )

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
          <DropdownMenu.Item
            className="desktop-titlebar__agent-menu-item"
            disabled={!onOpenAppearance}
            onSelect={onOpenAppearance}
          >
            <Palette aria-hidden="true" />
            <span>Appearance</span>
          </DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger
              className="desktop-titlebar__agent-menu-item"
              disabled={
                !activeThemePresetId || !onSelectThemePreset || !themePresets
              }
            >
              <SwatchBook aria-hidden="true" />
              <span>Preset</span>
              <span className="desktop-titlebar__agent-menu-trailing">
                <span className="desktop-titlebar__agent-menu-value">
                  {activeThemePreset?.label ?? activeThemePresetId}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className="desktop-titlebar__agent-menu-chevron"
                />
              </span>
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent
                aria-label="Preset"
                className="desktop-titlebar__agent-menu-subcontent"
                collisionPadding={8}
                sideOffset={6}
              >
                <DropdownMenu.RadioGroup
                  onValueChange={(presetId) =>
                    onSelectThemePreset?.(
                      presetId as CanvasNavigationThemePreset["id"]
                    )
                  }
                  value={activeThemePresetId}
                >
                  {themePresets?.map((preset) => (
                    <DropdownMenu.RadioItem
                      className="desktop-titlebar__agent-menu-item desktop-titlebar__agent-menu-radio-item"
                      key={preset.id}
                      value={preset.id}
                    >
                      <span>{preset.label}</span>
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
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
  onActivateTab = () => {},
  onCloseTab = () => {},
  onCreateArtifact = () => {},
  onOpenCodexThreadManager,
  onOpenAppearance,
  onRequestDeleteArtifact = () => {},
  onRenameArtifactTitle = () => {},
  onSearchArtifacts,
  onSelectLanguage,
  onSelectThemeMode,
  onSelectThemePreset,
  platform = readDesktopPlatform(),
  themeMode,
  windowControls,
}: {
  artifactTitleRenameResult?: ArtifactTitleRenameResult | null
  navigation?: CanvasNavigationSnapshot | null
  onActivateTab?: (tabId: string) => void
  onCloseTab?: (tabId: string) => void
  onCreateArtifact?: () => void
  onOpenCodexThreadManager?: () => void
  onOpenAppearance?: () => void
  onRequestDeleteArtifact?: (filePath: string) => void
  onRenameArtifactTitle?: (input: {
    filePath: string
    requestId: string
    title: string
  }) => void
  onSearchArtifacts?: () => void
  onSelectLanguage?: (language: CanvasNavigationLanguage) => void
  onSelectThemeMode?: (mode: CanvasThemeMode) => void
  onSelectThemePreset?: (
    presetId: CanvasNavigationThemePreset["id"]
  ) => void
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
  }, [navigation?.tabSession.activeTabId, navigation?.createArtifactActive])

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
    if (event.button !== 0 || event.detail > 1) {
      return
    }
    runWindowAction(controls.startDragging)
  }
  const handleDoubleClick = () => {
    runWindowAction(controls.toggleMaximize)
  }
  const handleArtifactWheel = (event: WheelEvent<HTMLElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return
    }
    event.currentTarget.scrollLeft += event.deltaY
  }
  const handleWorkspaceTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return
    }
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    ).sort(
      (left, right) =>
        Number(left.dataset.tabOrder) - Number(right.dataset.tabOrder)
    )
    const currentIndex = tabs.indexOf(
      document.activeElement as HTMLButtonElement
    )
    if (currentIndex === -1 || tabs.length === 0) return
    event.preventDefault()
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : event.key === "ArrowRight"
            ? (currentIndex + 1) % tabs.length
            : (currentIndex - 1 + tabs.length) % tabs.length
    tabs[nextIndex]?.focus()
  }
  const workspaceTabCount = navigation?.tabSession.tabs.length ?? 0
  const workspaceTabOrder = (tabId: string) =>
    navigation?.tabSession.tabs.findIndex((tab) => tab.id === tabId) ?? -1

  return (
    <header
      aria-label="Application title bar"
      className="desktop-titlebar"
      data-navigation={showsWorkspaceNavigation ? "workspace" : "home"}
      data-platform={platform}
    >
      {showsWorkspaceNavigation ? (
        <nav aria-label="Workspace" className="desktop-titlebar__navigation">
          <div
            aria-busy={
              (navigation?.artifactsLoading ?? true) ||
              (navigation?.canvasesLoading ?? false)
            }
            className="desktop-titlebar__tabs"
            onKeyDown={handleWorkspaceTabKeyDown}
            onWheel={handleArtifactWheel}
            role="tablist"
            aria-label="Open workspace tabs"
          >
            {navigation?.tabSession.tabs
              .filter((tab) => tab.kind === "artifact")
              .map((tab) => {
                const artifact = navigation.artifacts.find(
                  (candidate) => candidate.filePath === tab.filePath
                )
                if (!artifact) return null
                const active =
                  !navigation.createArtifactActive &&
                  tab.id === navigation.tabSession.activeTabId
                const editor =
                  titleEditor?.filePath === artifact.filePath
                    ? titleEditor
                    : null
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
                        className="desktop-titlebar__tab"
                        data-active={active ? "" : undefined}
                        data-editing={editing ? "" : undefined}
                        style={{ order: workspaceTabOrder(tab.id) }}
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
                                className="desktop-titlebar__tab-input"
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
                            aria-selected={active}
                            aria-posinset={workspaceTabOrder(tab.id) + 1}
                            aria-setsize={workspaceTabCount}
                            className="desktop-titlebar__tab-label"
                            onClick={() => onActivateTab(tab.id)}
                            ref={active ? activeArtifactRef : undefined}
                            role="tab"
                            data-tab-order={workspaceTabOrder(tab.id)}
                            tabIndex={active ? 0 : -1}
                            title={displayedTitle}
                            type="button"
                          >
                            <span className="desktop-titlebar__tab-title">
                              {displayedTitle}
                            </span>
                          </button>
                        )}
                        {!editing && (
                          <button
                            aria-label={`Close ${displayedTitle}`}
                            className="desktop-titlebar__tab-close"
                            onClick={() => onCloseTab(tab.id)}
                            title={`Close ${displayedTitle}`}
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
                        <ContextMenu.Item
                          className="desktop-titlebar__context-menu-item"
                          onSelect={() =>
                            onRequestDeleteArtifact(artifact.filePath)
                          }
                        >
                          Delete
                        </ContextMenu.Item>
                      </ContextMenu.Content>
                    </ContextMenu.Portal>
                  </ContextMenu.Root>
                )
              })}
            {navigation?.tabSession.tabs
              .filter((tab) => tab.kind === "canvas")
              .map((tab) => {
                const canvas = navigation.canvases?.find(
                  (candidate) => candidate.filePath === tab.filePath
                )
                if (!canvas) return null
                const active =
                  !navigation.createArtifactActive &&
                  tab.id === navigation.tabSession.activeTabId
                return (
                  <div
                    className="desktop-titlebar__tab"
                    data-active={active ? "" : undefined}
                    data-kind="canvas"
                    key={canvas.filePath}
                    style={{ order: workspaceTabOrder(tab.id) }}
                  >
                    <button
                      aria-selected={active}
                      aria-posinset={workspaceTabOrder(tab.id) + 1}
                      aria-setsize={workspaceTabCount}
                      className="desktop-titlebar__tab-label"
                      onClick={() => onActivateTab(tab.id)}
                      ref={active ? activeArtifactRef : undefined}
                      role="tab"
                      data-tab-order={workspaceTabOrder(tab.id)}
                      tabIndex={active ? 0 : -1}
                      title={canvas.title}
                      type="button"
                    >
                      <span className="desktop-titlebar__tab-title">
                        {canvas.title}
                      </span>
                    </button>
                    <button
                      aria-label={`Close ${canvas.title}`}
                      className="desktop-titlebar__tab-close"
                      onClick={() => onCloseTab(tab.id)}
                      title={`Close ${canvas.title}`}
                      type="button"
                    >
                      <X aria-hidden="true" />
                    </button>
                  </div>
                )
              })}
            {navigation?.tabSession.tabs.some(
              (tab) => tab.kind === "appearance"
            ) ? (
              <div
                className="desktop-titlebar__tab"
                data-active={
                  navigation.tabSession.activeTabId === "appearance"
                    ? ""
                    : undefined
                }
                key="appearance"
                style={{ order: workspaceTabOrder("appearance") }}
              >
                <button
                  aria-posinset={workspaceTabOrder("appearance") + 1}
                  aria-selected={
                    navigation.tabSession.activeTabId === "appearance"
                  }
                  aria-setsize={workspaceTabCount}
                  className="desktop-titlebar__tab-label"
                  data-tab-order={workspaceTabOrder("appearance")}
                  onClick={() => onActivateTab("appearance")}
                  ref={
                    navigation.tabSession.activeTabId === "appearance"
                      ? activeArtifactRef
                      : undefined
                  }
                  role="tab"
                  tabIndex={
                    navigation.tabSession.activeTabId === "appearance" ? 0 : -1
                  }
                  title="Appearance"
                  type="button"
                >
                  <span className="desktop-titlebar__tab-title">
                    Appearance
                  </span>
                </button>
                <button
                  aria-label="Close Appearance"
                  className="desktop-titlebar__tab-close"
                  onClick={() => onCloseTab("appearance")}
                  title="Close Appearance"
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            ) : null}
            {navigation?.tabSession.tabs.some(
              (tab) => tab.kind === "thread-manager"
            ) ? (
              <div
                className="desktop-titlebar__tab"
                data-active={
                  navigation.tabSession.activeTabId === "threads"
                    ? ""
                    : undefined
                }
                data-kind="threads"
                style={{ order: workspaceTabOrder("threads") }}
              >
                <button
                  aria-selected={
                    navigation.tabSession.activeTabId === "threads"
                  }
                  aria-posinset={workspaceTabOrder("threads") + 1}
                  aria-setsize={workspaceTabCount}
                  className="desktop-titlebar__tab-label"
                  onClick={() => onActivateTab("threads")}
                  ref={
                    navigation.tabSession.activeTabId === "threads"
                      ? activeArtifactRef
                      : undefined
                  }
                  role="tab"
                  data-tab-order={workspaceTabOrder("threads")}
                  tabIndex={
                    navigation.tabSession.activeTabId === "threads" ? 0 : -1
                  }
                  title="Threads"
                  type="button"
                >
                  <span className="desktop-titlebar__tab-title">Threads</span>
                </button>
                <button
                  aria-label="Close Threads"
                  className="desktop-titlebar__tab-close"
                  onClick={() => onCloseTab("threads")}
                  title="Close Threads"
                  type="button"
                >
                  <X aria-hidden="true" />
                </button>
              </div>
            ) : null}
            {navigation?.tabSession.tabs
              .filter((tab) => tab.kind === "thread")
              .map((tab) => {
                const title =
                  navigation.threads.find(
                    (thread) => thread.id === tab.threadId
                  )?.title ?? tab.threadId.slice(0, 8)
                const active =
                  !navigation.createArtifactActive &&
                  navigation.tabSession.activeTabId === tab.id
                return (
                  <div
                    className="desktop-titlebar__tab"
                    data-active={active ? "" : undefined}
                    data-kind="thread"
                    key={tab.id}
                    style={{ order: workspaceTabOrder(tab.id) }}
                  >
                    <button
                      aria-selected={active}
                      aria-posinset={workspaceTabOrder(tab.id) + 1}
                      aria-setsize={workspaceTabCount}
                      className="desktop-titlebar__tab-label"
                      onClick={() => onActivateTab(tab.id)}
                      ref={active ? activeArtifactRef : undefined}
                      role="tab"
                      data-tab-order={workspaceTabOrder(tab.id)}
                      tabIndex={active ? 0 : -1}
                      title={title}
                      type="button"
                    >
                      <span className="desktop-titlebar__tab-title">
                        {title}
                      </span>
                    </button>
                    <button
                      aria-label={`Close ${title}`}
                      className="desktop-titlebar__tab-close"
                      onClick={() => onCloseTab(tab.id)}
                      title={`Close ${title}`}
                      type="button"
                    >
                      <X aria-hidden="true" />
                    </button>
                  </div>
                )
              })}
            {!navigation && (
              <span
                aria-hidden="true"
                className="desktop-titlebar__tab-placeholder"
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
          <div
            aria-hidden="true"
            className="desktop-titlebar__drag-space desktop-titlebar__drag-space--navigation"
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleDragStart}
          />
        </nav>
      ) : null}
      <div
        aria-hidden="true"
        className="desktop-titlebar__drag-space"
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleDragStart}
      />
      {showsWorkspaceNavigation && (
        <AgentMenuButton
          activeCodexThreadLabel={navigation?.activeCodexThreadLabel}
          activeLanguage={navigation?.activeLanguage}
          activeThemePresetId={navigation?.activeThemePresetId}
          align="end"
          className="desktop-titlebar__brand desktop-titlebar__brand--compact desktop-titlebar__navigation-action desktop-titlebar__agent-menu-trigger"
          onSearchArtifacts={onSearchArtifacts}
          onOpenAppearance={onOpenAppearance}
          onOpenCodexThreadManager={onOpenCodexThreadManager}
          onSelectLanguage={onSelectLanguage}
          onSelectThemeMode={onSelectThemeMode}
          onSelectThemePreset={onSelectThemePreset}
          themePresets={navigation?.themePresets}
          themeMode={themeMode}
        />
      )}
      <div className="desktop-titlebar__controls">{windowActions}</div>
    </header>
  )
}
