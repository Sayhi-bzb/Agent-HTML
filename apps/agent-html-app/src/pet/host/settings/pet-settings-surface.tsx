import { RotateCwIcon, SettingsIcon, XIcon } from "lucide-react"

import { Button } from "@/app/shared/ui/button"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import { Separator } from "@/app/shared/ui/separator"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarStateProvider,
} from "@/app/shared/ui/sidebar"
import { SettingsInfoPanel } from "@/app/shell/settings-surface"
import { cn } from "@/app/shared/lib/utils"

import { ConfirmSettingsMutationDialog } from "./settings-shared"
import type { PetSettingsBridge } from "./types"
import { settingsViews } from "./types"
import { SettingsViewContent } from "./views"

export function PetSettingsSurface({
  bridge,
  className,
  headerSlot,
  renderHeader = true,
  subtitle,
}: {
  bridge: PetSettingsBridge
  className?: string
  headerSlot?: (header: React.ReactNode) => React.ReactNode
  renderHeader?: boolean
  subtitle?: string
}) {
  const { dispatch, snapshot } = bridge
  const { activeView, codex } = snapshot
  const runtimeStatus = codex.runtimeStatus
  const isRuntimeRefreshDisabled =
    codex.status !== "connected" || runtimeStatus.status === "loading"
  const resolvedSubtitle =
    subtitle ??
    (runtimeStatus.status === "loading"
      ? "Loading runtime"
      : `${activeView} settings`)
  const header = (
    <header
      className="flex min-h-14 cursor-grab items-center gap-3 bg-muted/30 px-4 active:cursor-grabbing"
      data-selection="none"
    >
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
        <SettingsIcon aria-hidden="true" className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-medium leading-5">
          AgentHTML settings
        </h2>
        <p className="truncate text-xs leading-4 text-muted-foreground">
          {resolvedSubtitle}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          data-popover-no-drag
          data-window-no-drag
          disabled={isRuntimeRefreshDisabled}
          onClick={() => dispatch({ type: "refresh-runtime-status" })}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <RotateCwIcon aria-hidden="true" className="size-4" />
          <span className="sr-only">
            {runtimeStatus.status === "loading" ? "Loading" : "Refresh"}
          </span>
        </Button>
        <Button
          aria-label="Close settings"
          data-popover-no-drag
          data-window-no-drag
          onClick={() => dispatch({ type: "close" })}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <XIcon aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </header>
  )

  return (
    <SidebarStateProvider>
      <section
        className={cn(
          "flex h-[min(34rem,calc(100vh-5rem))] min-h-96 w-[min(52rem,calc(100vw-4rem))] flex-col overflow-hidden rounded-lg border bg-background text-foreground shadow-sm",
          className
        )}
        style={
          {
            "--sidebar": "var(--background)",
            "--sidebar-foreground": "var(--foreground)",
            "--sidebar-accent": "var(--muted)",
            "--sidebar-accent-foreground": "var(--foreground)",
            "--sidebar-border": "var(--border)",
            "--sidebar-ring": "var(--ring)",
          } as React.CSSProperties
        }
      >
        {renderHeader ? (headerSlot ? headerSlot(header) : header) : null}
        {renderHeader ? <Separator /> : null}
        <main className="flex min-h-0 flex-1">
          <aside className="flex w-44 shrink-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
            <SidebarContent data-pet-settings-no-drag="">
              <SidebarGroup>
                <SidebarGroupLabel>Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-1">
                    {settingsViews.map((view) => (
                      <SidebarMenuItem key={view}>
                        <SidebarMenuButton
                          isActive={activeView === view}
                          onClick={() =>
                            dispatch({ type: "set-active-view", view })
                          }
                          type="button"
                        >
                          <span className="truncate">{view}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </aside>
          <ScrollArea
            className="min-h-0 min-w-0 flex-1"
            data-pet-settings-no-drag=""
            viewportClassName="p-4"
          >
            <div className="grid gap-3">
              {codex.mutationError ? (
                <SettingsInfoPanel variant="destructive">
                  {codex.mutationError}
                </SettingsInfoPanel>
              ) : null}
              <SettingsViewContent
                dispatch={dispatch}
                snapshot={snapshot}
              />
            </div>
          </ScrollArea>
        </main>
      </section>
      <ConfirmSettingsMutationDialog
        mutation={codex.pendingMutation}
        onCancel={() => dispatch({ type: "cancel-mutation" })}
        onConfirm={() => dispatch({ type: "confirm-mutation" })}
      />
    </SidebarStateProvider>
  )
}
