import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/shared/ui/accordion"
import {
  DropdownMenuCheckboxItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import {
  getAppLanguageLabel,
  getResolvedAppLocaleLabel,
  useLanguage,
  type AppLanguage,
  type ResolvedAppLocale,
} from "@/app/shared/language-provider"
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
  LanguagesIcon,
  MonitorIcon,
  MoonIcon,
  RefreshCwIcon,
  Settings2Icon,
  SquareIcon,
  SunIcon,
} from "lucide-react"
import * as React from "react"
import { Trans, useLingui } from "@lingui/react/macro"

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

const languageItems: {
  label: string
  value: AppLanguage
}[] = [
  {
    label: "System",
    value: "system",
  },
  {
    label: "English",
    value: "en",
  },
  {
    label: "中文",
    value: "zh",
  },
]

function getLanguageMenuLabel(
  language: AppLanguage,
  resolvedLocale: ResolvedAppLocale
) {
  if (language === "system") {
    return `System · ${getResolvedAppLocaleLabel(resolvedLocale)}`
  }

  return getAppLanguageLabel(language, resolvedLocale)
}

function getThemeMenuLabel(theme: Theme) {
  if (theme === "light") return "Light"
  if (theme === "dark") return "Dark"
  return "System"
}

function LocalizedLanguageLabel({
  label,
}: {
  label: "English" | "System · English" | "System · 中文" | "中文"
}) {
  const { t } = useLingui()

  if (label === "System · English") return t`System · English`
  if (label === "System · 中文") return t`System · 中文`
  if (label === "English") return t`English`
  return t`中文`
}

function LocalizedThemeLabel({ label }: { label: "Dark" | "Light" | "System" }) {
  const { t } = useLingui()

  if (label === "Light") return t`Light`
  if (label === "Dark") return t`Dark`
  return t`System`
}

function CodexConnectionDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const { t } = useLingui()
  const codexConnection = useCodexConnection()
  const [draftSettings, setDraftSettings] = React.useState(
    codexConnection.settings
  )
  const wasOpenRef = React.useRef(false)
  const statusSummary = !codexConnection.isLoaded
    ? t`Loading saved settings...`
    : codexConnection.status === "connected"
      ? t`Connected`
      : codexConnection.status === "starting"
        ? t`Starting...`
        : codexConnection.status === "error"
          ? t`Connection failed`
          : t`Not connected`

  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraftSettings(codexConnection.settings)
    }
    wasOpenRef.current = open
  }, [codexConnection.settings, open])

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
    void codexConnection.updateSettings(draftSettings)
  }, [codexConnection, draftSettings])

  const runAction = React.useCallback(
    async (action: (settingsOverride?: typeof draftSettings) => Promise<void>) => {
      await codexConnection.updateSettings(draftSettings)
      await action(draftSettings)
    },
    [codexConnection, draftSettings]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            <Trans>Codex Connection</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>
              Agent-HTML connects to Codex automatically and uses the official
              Codex configuration files for agent behavior.
            </Trans>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                <Trans>Status</Trans>
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {statusSummary}
              </p>
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
          <p className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
            <Trans>
              Codex model, approval, sandbox, profile, and trust settings are read
              by Codex from its official config layers, including user and project
              config files. Agent-HTML only manages the local Codex host lifecycle.
            </Trans>
          </p>
          {codexConnection.lastError ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {codexConnection.lastError}
            </p>
          ) : null}
          {!codexConnection.canManageHost ? (
            <p className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
              <Trans>
                Desktop runtime required to manage Codex.
              </Trans>
            </p>
          ) : null}
          <Accordion
            type="multiple"
            defaultValue={
              codexConnection.lastError ? ["logs-diagnostics"] : undefined
            }
            className="rounded-lg border px-3"
          >
            <AccordionItem value="advanced">
              <AccordionTrigger>
                <Trans>Advanced Connection</Trans>
              </AccordionTrigger>
              <AccordionContent className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="codex-command">
                    <Trans>Codex command</Trans>
                  </Label>
                  <Input
                    id="codex-command"
                    onChange={updateTextSetting("codexCommand")}
                    value={draftSettings.codexCommand}
                  />
                </div>
                <div>
                  <Button
                    disabled={codexConnection.isBusy}
                    onClick={() => void runAction(codexConnection.test)}
                    type="button"
                    variant="outline"
                  >
                    <CableIcon />
                    <Trans>Test connection</Trans>
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="logs-diagnostics">
              <AccordionTrigger>
                <Trans>Logs & Diagnostics</Trans>
              </AccordionTrigger>
              <AccordionContent className="grid gap-3">
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
                  <Trans>Enable event logs</Trans>
                </label>
                {draftSettings.eventLogEnabled ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="codex-event-log">
                        <Trans>Event log path</Trans>
                      </Label>
                      <Input
                        id="codex-event-log"
                        onChange={updateTextSetting("eventLogPath")}
                        value={draftSettings.eventLogPath}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="codex-server-log">
                        <Trans>Codex event log path</Trans>
                      </Label>
                      <Input
                        id="codex-server-log"
                        onChange={updateTextSetting("codexEventLogPath")}
                        value={draftSettings.codexEventLogPath}
                      />
                    </div>
                  </div>
                ) : null}
                <div>
                  <Button
                    disabled={!codexConnection.isLoaded}
                    onClick={() =>
                      void codexConnection
                        .openLogs(draftSettings)
                        .catch((error) =>
                          window.alert(
                            error instanceof Error ? error.message : String(error)
                          )
                        )
                    }
                    type="button"
                    variant="outline"
                  >
                    <Trans>Open log folder</Trans>
                  </Button>
                </div>
                <dl className="grid gap-2 rounded-lg border p-3 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="text-muted-foreground">
                      <Trans>Provider</Trans>
                    </dt>
                    <dd>{codexConnection.health?.provider ?? t`unknown`}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      <Trans>App server</Trans>
                    </dt>
                    <dd>
                      {codexConnection.health?.appServerRunning
                        ? t`running`
                        : t`off`}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">
                      <Trans>Thread</Trans>
                    </dt>
                    <dd className="break-all">
                      {codexConnection.health?.threadId ?? t`none`}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">
                      <Trans>Codex command</Trans>
                    </dt>
                    <dd className="break-all">
                      {codexConnection.health?.codexCommand ?? t`unknown`}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-muted-foreground">
                      <Trans>Codex cwd</Trans>
                    </dt>
                    <dd className="break-all">
                      {codexConnection.health?.cwd ?? t`unknown`}
                    </dd>
                  </div>
                </dl>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DialogFooter className="items-center sm:justify-between">
          <Button onClick={saveDraft} type="button" variant="outline">
            <Trans>Save</Trans>
          </Button>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              disabled={
                codexConnection.isBusy ||
                !codexConnection.isLoaded ||
                codexConnection.status === "disconnected"
              }
              onClick={() => void runAction(codexConnection.stop)}
              type="button"
              variant="outline"
            >
              <SquareIcon />
              <Trans>Stop</Trans>
            </Button>
            <Button
              disabled={codexConnection.isBusy || !codexConnection.isLoaded}
              onClick={() => void runAction(codexConnection.restart)}
              type="button"
            >
              <RefreshCwIcon />
              <Trans>Restart</Trans>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SettingsMenu() {
  const { isMobile } = useSidebar()
  const { language, resolvedLocale, setLanguage } = useLanguage()
  const { setTheme, theme } = useTheme()
  const [codexOpen, setCodexOpen] = React.useState(false)
  const languageSummary = getLanguageMenuLabel(language, resolvedLocale)

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
              <span>
                <Trans>Settings</Trans>
              </span>
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
            <Trans>Account</Trans>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BellIcon />
            <Trans>Notifications</Trans>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setCodexOpen(true)}>
            <CableIcon />
            <Trans>Codex Connection</Trans>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LanguagesIcon />
              <Trans>Language</Trans>
              <span className="ml-auto max-w-28 truncate text-xs text-muted-foreground">
                <LocalizedLanguageLabel
                  label={
                    languageSummary as
                      | "English"
                      | "System · English"
                      | "System · 中文"
                      | "中文"
                  }
                />
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-44 rounded-lg">
                <DropdownMenuRadioGroup
                  onValueChange={(value) => setLanguage(value as AppLanguage)}
                  value={language}
                >
                  {languageItems.map((item) => {
                    const label = getLanguageMenuLabel(
                      item.value,
                      resolvedLocale
                    ) as
                      | "English"
                      | "System · English"
                      | "System · 中文"
                      | "中文"

                    return (
                      <DropdownMenuRadioItem key={item.value} value={item.value}>
                        <LocalizedLanguageLabel label={label} />
                      </DropdownMenuRadioItem>
                    )
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SunIcon />
              <Trans>Theme</Trans>
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
                      <LocalizedThemeLabel label={getThemeMenuLabel(item.value)} />
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
