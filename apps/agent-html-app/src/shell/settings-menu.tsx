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
  SettingsDiagnosticsList,
  SettingsInfoPanel,
  SettingsStatusPanel,
} from "@/app/shell/settings-surface"
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
import { useLingui } from "@lingui/react"
import { Trans } from "@lingui/react/macro"
import type { CodexRuntimeCapabilityStatus } from "@/app/codex/connection"

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

function formatCapability(
  capability: CodexRuntimeCapabilityStatus,
  translate: (descriptor: { id: string }) => string
) {
  if (!capability.ok) {
    return capability.error ?? translate({ id: "unavailable" })
  }

  return typeof capability.count === "number"
    ? String(capability.count)
    : translate({ id: "available" })
}

function SettingsDiagnosticsSection({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <section className="grid gap-2">
      <h4 className="text-xs font-medium uppercase text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  )
}

function LocalizedLanguageLabel({
  label,
}: {
  label: "English" | "System · English" | "System · 中文" | "中文"
}) {
  const { _ } = useLingui()

  if (label === "System · English") return _({ id: "System · English" })
  if (label === "System · 中文") return _({ id: "System · 中文" })
  if (label === "English") return _({ id: "English" })
  return _({ id: "中文" })
}

function LocalizedThemeLabel({ label }: { label: "Dark" | "Light" | "System" }) {
  const { _ } = useLingui()

  if (label === "Light") return _({ id: "Light" })
  if (label === "Dark") return _({ id: "Dark" })
  return _({ id: "System" })
}

function CodexConnectionDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const { _ } = useLingui()
  const codexConnection = useCodexConnection()
  const runtimeStatus = codexConnection.runtimeStatus
  const [draftSettings, setDraftSettings] = React.useState(
    codexConnection.settings
  )
  const [accordionValue, setAccordionValue] = React.useState<string[]>([])
  const wasOpenRef = React.useRef(false)
  const displayStatus = codexConnection.status
  const statusSummary = codexConnection.phase === "loadingSettings"
    ? _({ id: "Loading saved settings..." })
    : codexConnection.phase === "connected"
      ? _({ id: "Connected" })
      : codexConnection.phase === "connecting"
        ? _({ id: "Starting..." })
        : codexConnection.phase === "error"
          ? _({ id: "Connection failed" })
          : _({ id: "Not connected" })

  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraftSettings(codexConnection.settings)
      setAccordionValue(codexConnection.lastError ? ["diagnostics"] : [])
    }
    wasOpenRef.current = open
  }, [codexConnection.lastError, codexConnection.settings, open])

  React.useEffect(() => {
    if (
      open &&
      accordionValue.includes("diagnostics") &&
      codexConnection.status === "connected" &&
      runtimeStatus.status === "idle"
    ) {
      void codexConnection.refreshRuntimeStatus()
    }
  }, [accordionValue, codexConnection, open, runtimeStatus.status])

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
      try {
        await action(draftSettings)
      } catch {
        // The connection provider owns the visible error state.
      }
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
          <SettingsStatusPanel
            label={<Trans>Status</Trans>}
            description={statusSummary}
            action={
              <Badge
                variant={
                  displayStatus === "connected"
                    ? "default"
                    : displayStatus === "error"
                      ? "destructive"
                      : "outline"
                }
              >
                {displayStatus}
              </Badge>
            }
          />
          <SettingsInfoPanel>
            <Trans>
              Codex model, approval, sandbox, profile, and trust settings are read
              by Codex from its official config layers, including user and project
              config files. Agent-HTML only manages the local Codex host lifecycle.
            </Trans>
          </SettingsInfoPanel>
          {codexConnection.lastError ? (
            <SettingsInfoPanel variant="destructive">
              {codexConnection.lastError}
            </SettingsInfoPanel>
          ) : null}
          {!codexConnection.canManageHost ? (
            <SettingsInfoPanel>
              <Trans>
                Desktop runtime required to manage Codex.
              </Trans>
            </SettingsInfoPanel>
          ) : null}
          <Accordion
            type="multiple"
            onValueChange={setAccordionValue}
            value={accordionValue}
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
            <AccordionItem value="diagnostics">
              <AccordionTrigger>
                <Trans>Diagnostics</Trans>
              </AccordionTrigger>
              <AccordionContent className="grid gap-3">
                <div className="flex justify-end">
                  <Button
                    disabled={
                      codexConnection.status !== "connected" ||
                      runtimeStatus.status === "loading"
                    }
                    onClick={() => void codexConnection.refreshRuntimeStatus()}
                    type="button"
                    variant="outline"
                  >
                    <RefreshCwIcon />
                    <Trans>Refresh</Trans>
                  </Button>
                </div>
                <SettingsInfoPanel>
                  <Trans>
                    Codex runtime details are read from the official App Server
                    APIs. Agent-HTML does not edit model, MCP, skill, plugin, or
                    app configuration here.
                  </Trans>
                </SettingsInfoPanel>
                <SettingsDiagnosticsSection title="Connection">
                  <SettingsDiagnosticsList
                    items={[
                      {
                        label: <Trans>App server</Trans>,
                        value: codexConnection.health?.appServerRunning
                          ? _({ id: "running" })
                          : _({ id: "off" }),
                      },
                      {
                        label: <Trans>Thread</Trans>,
                        span: "full",
                        value:
                          codexConnection.activeThreadId ?? _({ id: "none" }),
                      },
                      {
                        label: <Trans>Codex command</Trans>,
                        span: "full",
                        value:
                          codexConnection.health?.codexCommand ??
                          _({ id: "unknown" }),
                      },
                      {
                        label: <Trans>Codex cwd</Trans>,
                        span: "full",
                        value: codexConnection.health?.cwd ?? _({ id: "unknown" }),
                      },
                    ]}
                  />
                </SettingsDiagnosticsSection>
                <SettingsDiagnosticsSection title="Runtime">
                  <SettingsDiagnosticsList
                    items={[
                      {
                        label: <Trans>Runtime status</Trans>,
                        value: runtimeStatus.status,
                      },
                      {
                        label: <Trans>Model</Trans>,
                        value:
                          runtimeStatus.config.model ?? _({ id: "unknown" }),
                      },
                      {
                        label: <Trans>Model provider</Trans>,
                        value:
                          runtimeStatus.config.modelProvider ??
                          _({ id: "unknown" }),
                      },
                      {
                        label: <Trans>Sandbox</Trans>,
                        value:
                          runtimeStatus.config.sandboxMode ??
                          _({ id: "unknown" }),
                      },
                      {
                        label: <Trans>Approvals</Trans>,
                        value:
                          runtimeStatus.config.approvalPolicy ??
                          _({ id: "unknown" }),
                      },
                    ]}
                  />
                </SettingsDiagnosticsSection>
                <SettingsDiagnosticsSection title="Capabilities">
                  <SettingsDiagnosticsList
                    items={[
                      {
                        label: <Trans>Models</Trans>,
                        value: formatCapability(
                          runtimeStatus.capabilities.models,
                          _
                        ),
                      },
                      {
                        label: <Trans>MCP servers</Trans>,
                        value: formatCapability(
                          runtimeStatus.capabilities.mcpServers,
                          _
                        ),
                      },
                      {
                        label: <Trans>Skills</Trans>,
                        value: formatCapability(
                          runtimeStatus.capabilities.skills,
                          _
                        ),
                      },
                      {
                        label: <Trans>Plugins</Trans>,
                        value: formatCapability(
                          runtimeStatus.capabilities.plugins,
                          _
                        ),
                      },
                      {
                        label: <Trans>Apps</Trans>,
                        value: formatCapability(
                          runtimeStatus.capabilities.apps,
                          _
                        ),
                      },
                      {
                        label: <Trans>Collaboration modes</Trans>,
                        value: formatCapability(
                          runtimeStatus.capabilities.collaborationModes,
                          _
                        ),
                      },
                      {
                        label: <Trans>Config API</Trans>,
                        value: formatCapability(
                          runtimeStatus.capabilities.config,
                          _
                        ),
                      },
                    ]}
                  />
                </SettingsDiagnosticsSection>
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
              <span className="min-w-0 flex-1">
                <Trans>Language</Trans>
              </span>
              <span className="max-w-28 shrink-0 truncate text-xs text-muted-foreground">
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
