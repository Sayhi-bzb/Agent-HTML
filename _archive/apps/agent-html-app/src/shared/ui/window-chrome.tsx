import * as React from "react"
import { MinusIcon, SquareIcon, XIcon } from "lucide-react"

import {
  closeWindow,
  isDesktopRuntime,
  minimizeWindow,
  preloadCurrentWindowHandle,
  startWindowDrag,
  subscribeWindowMaximizedState,
  toggleMaximizeWindow,
} from "@/app/shared/lib/window-controls"
import { cn } from "@/app/shared/lib/utils"
import { Button } from "@/app/shared/ui/button"

const WINDOW_NO_DRAG_SELECTOR =
  'button,input,textarea,select,a,[role="button"],[role="menu"],[role="menuitem"],[data-window-no-drag],[data-tauri-no-drag]'

export function WindowChromeFrame({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const [isMaximized, setIsMaximized] = React.useState(false)

  React.useEffect(() => {
    preloadCurrentWindowHandle()
  }, [])

  React.useEffect(() => {
    let cleanup: (() => void) | undefined
    let isMounted = true

    void subscribeWindowMaximizedState((nextIsMaximized) => {
      if (isMounted) {
        setIsMaximized(nextIsMaximized)
      }
    }).then((unlisten) => {
      cleanup = unlisten
    })

    return () => {
      isMounted = false
      cleanup?.()
    }
  }, [])

  return (
    <div
      className="flex h-full min-h-0 w-full min-w-0 bg-transparent p-[var(--window-chrome-inset)] text-foreground"
      data-window-chrome-root=""
      data-window-maximized={isMaximized ? "" : undefined}
      style={style}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--window-chrome-radius)] bg-background shadow-[var(--window-chrome-shadow)]",
          className
        )}
        data-window-chrome-surface=""
      >
        {children}
      </div>
    </div>
  )
}

export function WindowTitlebar({
  children,
  className,
  drag = true,
}: {
  children: React.ReactNode
  className?: string
  drag?: boolean
}) {
  return (
    <header
      className={cn("flex shrink-0 items-center", className)}
      data-selection="none"
      data-window-titlebar=""
      onMouseDown={(event) => {
        if (
          !drag ||
          !isDesktopRuntime() ||
          event.button !== 0 ||
          isWindowNoDragTarget(event.target)
        ) {
          return
        }

        event.preventDefault()
        void startWindowDrag()
      }}
    >
      {children}
    </header>
  )
}

export function WindowDragHandle({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("min-w-0", className)}
      data-cursor="drag"
      data-window-drag-handle=""
      onMouseDown={(event) => {
        if (
          !isDesktopRuntime() ||
          event.button !== 0 ||
          isWindowNoDragTarget(event.target)
        ) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        void startWindowDrag()
      }}
      {...props}
    >
      {children}
    </div>
  )
}

function isWindowNoDragTarget(target: EventTarget | null) {
  return (
    target instanceof Element && target.closest(WINDOW_NO_DRAG_SELECTOR) !== null
  )
}

const chromeButtonClassName =
  "h-7 w-7 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

export function WindowControls({
  className,
  onClose,
}: {
  className?: string
  onClose?: () => void
}) {
  const desktopRuntime = isDesktopRuntime()

  return (
    <div
      className={cn("flex shrink-0 items-center gap-1", className)}
      data-tauri-no-drag=""
      data-window-no-drag=""
    >
      <Button
        aria-label="Minimize window"
        className={chromeButtonClassName}
        data-cursor="action"
        disabled={!desktopRuntime}
        onClick={() => {
          void minimizeWindow()
        }}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <MinusIcon className="size-4" />
      </Button>
      <Button
        aria-label="Toggle maximize window"
        className={chromeButtonClassName}
        data-cursor="action"
        disabled={!desktopRuntime}
        onClick={() => {
          void toggleMaximizeWindow()
        }}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <SquareIcon className="size-3.5" />
      </Button>
      <Button
        aria-label="Close window"
        className="h-7 w-7 rounded-md text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
        data-cursor="action"
        disabled={!desktopRuntime}
        onClick={() => {
          if (onClose) {
            onClose()
            return
          }

          void closeWindow()
        }}
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        <XIcon className="size-4" />
      </Button>
    </div>
  )
}
