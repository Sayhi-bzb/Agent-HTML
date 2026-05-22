import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { BellIcon, BadgeCheckIcon, Settings2Icon } from "lucide-react"

export function SettingsMenu() {
  const { isMobile } = useSidebar()

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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
