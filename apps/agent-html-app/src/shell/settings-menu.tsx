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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/shared/ui/dialog"
import { PetSettingsContent } from "@/app/pet/host/pet-settings-content"
import {
  getAppLanguageLabel,
  getResolvedAppLocaleLabel,
  useLanguage,
  type AppLanguage,
  type ResolvedAppLocale,
} from "@/app/shared/language-context"
import { useTheme, type Theme } from "@/app/shared/theme-context"
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
  Settings2Icon,
  SunIcon,
} from "lucide-react"
import * as React from "react"
import { useLingui } from "@lingui/react"
import { Trans } from "@lingui/react/macro"

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-0 bg-transparent p-0 shadow-none sm:max-w-none">
        <DialogHeader>
          <DialogTitle className="sr-only">
            <Trans>Codex Connection</Trans>
          </DialogTitle>
          <DialogDescription className="sr-only">
            <Trans>
              Agent-HTML connects to Codex automatically and uses the official
              Codex configuration files for agent behavior.
            </Trans>
          </DialogDescription>
        </DialogHeader>
        <PetSettingsContent
          initialView="Connection"
          onClose={() => onOpenChange(false)}
        />
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
