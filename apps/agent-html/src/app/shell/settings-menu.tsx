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
} from "@/shared/ui/dropdown-menu"
import { useTheme, type Theme } from "@/shared/theme-provider"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/shared/ui/sidebar"
import {
  BellIcon,
  BadgeCheckIcon,
  MonitorIcon,
  MoonIcon,
  Settings2Icon,
  SunIcon,
} from "lucide-react"

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

export function SettingsMenu() {
  const { isMobile } = useSidebar()
  const { setTheme, theme } = useTheme()

  return (
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
  )
}
