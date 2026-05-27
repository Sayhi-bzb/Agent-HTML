import {
  DropdownMenuCheckboxItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/app/shared/ui/dropdown-menu"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import { useCodexConnection } from "@/app/codex/connection"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/shared/ui/dialog"
import { Input } from "@/app/shared/ui/input"
import { Label } from "@/app/shared/ui/label"
import { useTheme, type Theme } from "@/app/shared/theme-provider"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/shared/ui/sidebar"
import {
  BellIcon,
  BadgeCheckIcon,
  CableIcon,
  MonitorIcon,
  MoonIcon,
  PlayIcon,
  RefreshCwIcon,
  Settings2Icon,
  SquareIcon,
  SunIcon,
} from "lucide-react"
import * as React from "react"

const themeItems: {
  icon: typeof SunIcon
  label: string
  value: Theme
}[] = [
  {
    icon: SunIcon,
    label: "Light",
    value: "light",
  },
  {
    icon: MoonIcon,
    label: "Dark",
    value: "dark",
  },
  {
    icon: MonitorIcon,
    label: "System",
    value: "system",
  },
]

function CodexConnectionDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const codexConnection = useCodexConnection()
  const [draftSettings, setDraftSettings] = React.useState(
    codexConnection.settings
  )

  React.useEffect(() => {
    if (open) {
      setDraftSettings(codexConnection.settings)
    }
  }, [codexConnection.settings, open])

  const handleNumberChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10)
      setDraftSettings((current) => ({
        ...current,
        bridgePort: Number.isFinite(value) ? value : current.bridgePort,
      }))
    },
    []
  )

  const updateTextSetting = React.useCallback(
    (key: keyof typeof draftSettings) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setDraftSettings((current) => ({
          ...current,
          [key]: event.target.value,
        }))
      },
    []
  )

  const saveDraft = React.useCallback(() => {
    codexConnection.updateSettings(draftSettings)
  }, [codexConnection, draftSettings])

  const runAction = React.useCallback(
    (action: (settingsOverride?: typeof draftSettings) => Promise<void>) => {
      codexConnection.updateSettings(draftSettings)
      void action(draftSettings)
    },
    [codexConnection, draftSettings]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Codex Connection</DialogTitle>
          <DialogDescription>
            Connect the desktop app to a local Codex app-server bridge.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">Status</p>
              <p className="truncate text-xs text-muted-foreground">
                {codexConnection.bridgeUrl ?? "Not connected"}
              </p>
              {codexConnection.ownership === "external" ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Connected to an existing bridge on this port.
                </p>
              ) : null}
            </div>
            <Badge
              variant={
                codexConnection.status === "connected"
                  ? "default"
                  : codexConnection.status === "error"
                    ? "destructive"
                    : "outline"
              }
            >
              {codexConnection.status}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="codex-command">Codex command</Label>
              <Input
                id="codex-command"
                onChange={updateTextSetting("codexCommand")}
                value={draftSettings.codexCommand}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codex-workspace">Workspace cwd</Label>
              <Input
                id="codex-workspace"
                onChange={updateTextSetting("workspaceCwd")}
                value={draftSettings.workspaceCwd}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codex-host">Bridge host</Label>
              <Input
                id="codex-host"
                onChange={updateTextSetting("bridgeHost")}
                value={draftSettings.bridgeHost}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="codex-port">Bridge port</Label>
              <Input
                id="codex-port"
                min={1}
                max={65535}
                onChange={handleNumberChange}
                type="number"
                value={draftSettings.bridgePort}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              checked={draftSettings.eventLogEnabled}
              className="size-4 accent-primary"
              onChange={(event) =>
                setDraftSettings((current) => ({
                  ...current,
                  eventLogEnabled: event.target.checked,
                }))
              }
              type="checkbox"
            />
            Enable event logs
          </label>
          {draftSettings.eventLogEnabled ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="codex-event-log">Event log path</Label>
                <Input
                  id="codex-event-log"
                  onChange={updateTextSetting("eventLogPath")}
                  value={draftSettings.eventLogPath}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="codex-server-log">Codex event log path</Label>
                <Input
                  id="codex-server-log"
                  onChange={updateTextSetting("codexEventLogPath")}
                  value={draftSettings.codexEventLogPath}
                />
              </div>
            </div>
          ) : null}
          <dl className="grid gap-2 rounded-lg border p-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Provider</dt>
              <dd>{codexConnection.health?.provider ?? "unknown"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">App server</dt>
              <dd>
                {codexConnection.health?.appServerRunning ? "running" : "off"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Thread</dt>
              <dd className="break-all">
                {codexConnection.health?.threadId ?? "none"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Codex command</dt>
              <dd className="break-all">
                {codexConnection.health?.codexCommand ?? "unknown"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Codex cwd</dt>
              <dd className="break-all">
                {codexConnection.health?.cwd ?? "unknown"}
              </dd>
            </div>
          </dl>
          {codexConnection.lastError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {codexConnection.lastError}
            </p>
          ) : null}
          {!codexConnection.canManageBridge ? (
            <p className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
              Desktop runtime required to manage Codex. Web mode can still use
              the development bridge fallback.
            </p>
          ) : null}
        </div>
        <DialogFooter className="items-center sm:justify-between">
          <Button onClick={saveDraft} type="button" variant="outline">
            Save
          </Button>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              disabled={codexConnection.isBusy}
              onClick={() => runAction(codexConnection.test)}
              type="button"
              variant="outline"
            >
              <CableIcon />
              Test
            </Button>
            <Button
              disabled={codexConnection.isBusy}
              onClick={() => runAction(codexConnection.stop)}
              type="button"
              variant="outline"
              title={
                codexConnection.ownership === "external"
                  ? "Disconnect from the existing bridge without stopping it."
                  : undefined
              }
            >
              <SquareIcon />
              {codexConnection.ownership === "external" ? "Disconnect" : "Stop"}
            </Button>
            <Button
              disabled={codexConnection.isBusy}
              onClick={() => runAction(codexConnection.restart)}
              type="button"
              variant="outline"
              title={
                codexConnection.ownership === "external"
                  ? "Reconnect to the existing bridge on this port."
                  : undefined
              }
            >
              <RefreshCwIcon />
              {codexConnection.ownership === "external" ? "Reconnect" : "Restart"}
            </Button>
            <Button
              disabled={codexConnection.isBusy}
              onClick={() => runAction(codexConnection.start)}
              type="button"
            >
              <PlayIcon />
              {codexConnection.isBusy ? "Connecting..." : "Connect"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SettingsMenu() {
  const { isMobile } = useSidebar()
  const { setTheme, theme } = useTheme()
  const [codexOpen, setCodexOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <SidebarMenuItem>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              type="button"
            >
              <Settings2Icon />
              <span>Settings</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
        </SidebarMenuItem>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuItem>
            <BadgeCheckIcon />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            Notifications
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCodexOpen(true)}>
            <CableIcon />
            Codex Connection
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunIcon />
              Theme
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-44 rounded-lg">
                {themeItems.map((item) => {
                  const Icon = item.icon

                  return (
                    <DropdownMenuCheckboxItem
                      key={item.value}
                      checked={theme === item.value}
                      onCheckedChange={() => setTheme(item.value)}
                    >
                      <Icon />
                      {item.label}
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
      <CodexConnectionDialog open={codexOpen} onOpenChange={setCodexOpen} />
    </>
  )
}
