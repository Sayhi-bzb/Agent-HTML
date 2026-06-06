import { Button } from "@/app/shared/ui/button"
import { useSidebar } from "@/app/shared/ui/sidebar"
import {
  DocumentTabRail,
  type HeaderTab,
} from "@/app/shell/document-tab-rail"
import {
  WindowControls,
  WindowTitlebar,
} from "@/app/shared/ui/window-chrome"
import { PanelLeftIcon } from "lucide-react"

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

  return (
    <WindowTitlebar
      className="z-50 flex items-center bg-sidebar text-sidebar-foreground"
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

        <div
          className="flex min-w-0 flex-1 items-center"
        >
          <DocumentTabRail
            activeTabId={activeTabId}
            onCloseTab={onCloseTab}
            onReorderTabs={onReorderTabs}
            onSelectTab={onSelectTab}
            tabs={tabs}
          />
        </div>

        <div aria-hidden="true" className="h-full w-10 shrink-0" />

        <WindowControls className="ml-auto" onClose={onCloseWindow} />
      </div>
    </WindowTitlebar>
  )
}

export type { HeaderTab }
