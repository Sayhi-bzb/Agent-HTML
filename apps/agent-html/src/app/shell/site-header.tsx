import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  closeWindow,
  getDragRegionProps,
  isDesktopRuntime,
  minimizeWindow,
  toggleMaximizeWindow,
} from "@/lib/window-controls"
import { MinusIcon, PanelLeftIcon, SquareIcon, XIcon } from "lucide-react"

type HeaderTab = {
  id: string
  isClosable: boolean
  label: string
}

export function SiteHeader({
  activeTabId,
  onCloseTab,
  onSelectTab,
  tabs,
}: {
  activeTabId: string | null
  onCloseTab: (tabId: string) => void
  onSelectTab: (tabId: string) => void
  tabs: HeaderTab[]
}) {
  const { toggleSidebar } = useSidebar()
  const desktopRuntime = isDesktopRuntime()
  const dragRegionProps = getDragRegionProps()

  return (
    <header className="sticky top-0 z-50 flex items-center bg-sidebar text-sidebar-foreground">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-2">
        <div className="flex items-center gap-1">
          <Button
            aria-label="Toggle sidebar"
            className="h-7 w-7 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            type="button"
          >
            <PanelLeftIcon className="size-4" />
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 items-end gap-2">
          <Tabs
            className="min-w-0 flex-1 gap-0 self-end"
            orientation="horizontal"
            onValueChange={onSelectTab}
            value={activeTabId ?? undefined}
          >
            <TabsList
              className="h-auto min-w-0 items-center justify-start gap-1 rounded-none bg-transparent p-0 text-sidebar-foreground/70"
              variant="line"
            >
              {tabs.map((tab) => {
                const isActive = tab.id === activeTabId

                return (
                  <div
                    key={tab.id}
                    className={cn(
                      "group relative flex max-w-[16rem] min-w-[12rem] flex-none items-center rounded-lg transition-colors",
                      isActive
                        ? "bg-card text-card-foreground shadow-sm"
                        : "bg-transparent text-sidebar-foreground/58 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <TabsTrigger
                      className={cn(
                        "h-8 min-w-0 flex-1 justify-start rounded-lg border-0 bg-transparent pl-3 pr-2 shadow-none data-active:after:hidden",
                        isActive
                          ? "text-card-foreground hover:text-card-foreground data-active:text-card-foreground"
                          : "text-sidebar-foreground/58 hover:text-sidebar-accent-foreground data-active:text-sidebar-accent-foreground"
                      )}
                      value={tab.id}
                    >
                      <span className="truncate text-sm font-medium">
                        {tab.label}
                      </span>
                    </TabsTrigger>
                    {tab.isClosable ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center pr-1">
                        <button
                          aria-label={`Close ${tab.label} tab`}
                          onClick={() => onCloseTab(tab.id)}
                          className={cn(
                            "inline-flex size-6 items-center justify-center rounded-md transition-[opacity,color,background-color] duration-150",
                            isActive
                              ? "text-card-foreground/60 hover:bg-muted hover:text-card-foreground"
                              : "pointer-events-none text-sidebar-foreground/48 opacity-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                          )}
                          type="button"
                        >
                          <XIcon className="size-3.5" />
                        </button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </TabsList>
          </Tabs>

          <div className="min-w-0 flex-1 self-stretch" {...dragRegionProps} />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button
            aria-label="Minimize window"
            className="h-7 w-7 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
            className="h-7 w-7 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
            disabled={!desktopRuntime}
            onClick={() => {
              void closeWindow()
            }}
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
