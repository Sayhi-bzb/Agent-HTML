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
  getAppLanguageLabel,
  getResolvedAppLocaleLabel,
  useLanguage,
  type AppLanguage,
  type ResolvedAppLocale,
} from "@/app/shared/language-context"
import { useColorMode, type ColorMode } from "@/app/shared/color-mode-context"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/app/shared/ui/sidebar"
import { usePetSettingsWindow } from "@/app/shell/pet-settings-window"
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
import { Trans } from "@lingui/react/macro"

const colorModeItems: {
  icon: typeof SunIcon
  label: string
  value: ColorMode
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

function getColorModeMenuLabel(colorMode: ColorMode) {
  if (colorMode === "light") return "Light"
  if (colorMode === "dark") return "Dark"
  return "System"
}

function LocalizedLanguageLabel({
  label,
}: {
  label: "English" | "System · English" | "System · 中文" | "中文"
}) {
  if (label === "System · English") return <Trans>System · English</Trans>
  if (label === "System · 中文") return <Trans>System · 中文</Trans>
  if (label === "English") return <Trans>English</Trans>
  return <Trans>中文</Trans>
}

function LocalizedThemeLabel({
  label,
}: {
  label: "Dark" | "Light" | "System"
}) {
  if (label === "Light") return <Trans>Light</Trans>
  if (label === "Dark") return <Trans>Dark</Trans>
  return <Trans>System</Trans>
}

export function SettingsMenu() {
  const { isMobile } = useSidebar()
  const petSettingsWindow = usePetSettingsWindow()
  const { language, resolvedLocale, setLanguage } = useLanguage()
  const { colorMode, setColorMode } = useColorMode()
  const languageSummary = getLanguageMenuLabel(language, resolvedLocale)

  return (
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
        <DropdownMenuItem onSelect={() => petSettingsWindow.open("Connection")}>
          <CableIcon />
          <Trans>Agent Settings</Trans>
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
                  ) as "English" | "System · English" | "System · 中文" | "中文"

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
              {colorModeItems.map((item) => {
                const Icon = item.icon

                return (
                  <DropdownMenuCheckboxItem
                    key={item.value}
                    checked={colorMode === item.value}
                    onCheckedChange={() => setColorMode(item.value)}
                  >
                    <Icon />
                    <LocalizedThemeLabel
                      label={getColorModeMenuLabel(item.value)}
                    />
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
