import { Copy, Minus, Square, X } from "lucide-react"
import { useEffect, useMemo, useState, type MouseEvent } from "react"

import { agentHtmlBrandName } from "../../../packages/cli/src/shared/brand"
import { AgentHtmlGhostIcon } from "../../../packages/cli/src/shared/brand-icons"
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
  platform = readDesktopPlatform(),
  windowControls,
}: {
  platform?: DesktopPlatform
  windowControls?: DesktopWindowControls
}) {
  const controls = useMemo(
    () => windowControls ?? createDesktopWindowControls(),
    [windowControls]
  )
  const [maximized, setMaximized] = useState(false)

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

  return (
    <header
      aria-label="Application title bar"
      className="desktop-titlebar"
      data-platform={platform}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleDragStart}
    >
      <div className="desktop-titlebar__brand">
        <AgentHtmlGhostIcon
          aria-hidden="true"
          className="desktop-titlebar__brand-icon"
        />
        <span className="desktop-titlebar__title">{agentHtmlBrandName}</span>
      </div>
      <div aria-hidden="true" className="desktop-titlebar__drag-space" />
      <div className="desktop-titlebar__controls">{windowActions}</div>
    </header>
  )
}
