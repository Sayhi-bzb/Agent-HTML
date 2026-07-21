import { Copy, Minus, PanelLeft, Plus, Square, X } from "lucide-react"
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
import type { CanvasNavigationSnapshot } from "../../../packages/cli/src/host/navigation/navigation-sync-contract"
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
  navigation,
  onCreateArtifact = () => {},
  onRequestDeleteArtifact = () => {},
  onSelectArtifact = () => {},
  onSetSidebarOpen = () => {},
  platform = readDesktopPlatform(),
  windowControls,
}: {
  navigation?: CanvasNavigationSnapshot | null
  onCreateArtifact?: () => void
  onRequestDeleteArtifact?: (filePath: string) => void
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
  const activeArtifactRef = useRef<HTMLButtonElement | null>(null)
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
      (event.target as HTMLElement).closest("button")
    ) {
      return
    }
    runWindowAction(controls.startDragging)
  }
  const handleDoubleClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("button")) return
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
              return (
                <div
                  className="desktop-titlebar__artifact"
                  data-active={active ? "" : undefined}
                  key={artifact.filePath}
                >
                  <button
                    aria-current={active ? "page" : undefined}
                    className="desktop-titlebar__artifact-label"
                    onClick={() => onSelectArtifact(artifact.filePath)}
                    ref={active ? activeArtifactRef : undefined}
                    title={artifact.title}
                    type="button"
                  >
                    <span className="desktop-titlebar__artifact-title">
                      {artifact.title}
                    </span>
                  </button>
                  <button
                    aria-label={`Delete ${artifact.title}`}
                    className="desktop-titlebar__artifact-close"
                    onClick={() => onRequestDeleteArtifact(artifact.filePath)}
                    title={`Delete ${artifact.title}`}
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
