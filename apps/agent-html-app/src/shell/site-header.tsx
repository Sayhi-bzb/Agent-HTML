import { Button } from "@/app/shared/ui/button"
import { useSidebar } from "@/app/shared/ui/sidebar"
import {
  DocumentTabRail,
  type HeaderTab,
} from "@/app/shell/document-tab-rail"
import {
  getDragRegionProps,
  isDesktopRuntime,
  minimizeWindow,
  toggleMaximizeWindow,
} from "@/app/shared/lib/window-controls"
import { MinusIcon, PanelLeftIcon, SquareIcon, XIcon } from "lucide-react"

const headerChromeButtonClassName =
  "h-7 w-7 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

export function SiteHeader({
  activeTabId,
  onCloseWindow,
  onCloseTab,
  onReorderTabs,
  onSelectTab,
  tabs,
}: {
  activeTabId: string | null
  onCloseWindow: () => void
  onCloseTab: (tabId: string) => void
  onReorderTabs?: (orderedTabIds: string[]) => void
  onSelectTab: (tabId: string) => void
  tabs: HeaderTab[]
}) {
  const { toggleSidebar } = useSidebar()
  const desktopRuntime = isDesktopRuntime()
  const dragRegionProps = getDragRegionProps()

  return (
    <header
      className="sticky top-0 z-50 flex items-center bg-sidebar text-sidebar-foreground"
      data-selection="none"
    >
      <div className="flex h-(--header-height) w-full items-center gap-2 px-2">
        <div className="flex shrink-0 items-center gap-1">
          <Button
            aria-label="Toggle sidebar"
            className={headerChromeButtonClassName}
            data-cursor="action"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            type="button"
          >
            <PanelLeftIcon className="size-4" />
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-center" {...dragRegionProps}>
          <DocumentTabRail
            activeTabId={activeTabId}
            onCloseTab={onCloseTab}
            onReorderTabs={onReorderTabs}
            onSelectTab={onSelectTab}
            tabs={tabs}
          />
        </div>

        <div
          aria-hidden="true"
          className="h-full w-10 shrink-0"
          {...dragRegionProps}
        />

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            aria-label="Minimize window"
            className={headerChromeButtonClassName}
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
            className={headerChromeButtonClassName}
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
            onClick={onCloseWindow}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export type { HeaderTab }
