import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Settings2Icon } from "lucide-react"

export function SettingsMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton type="button">
          <Settings2Icon />
          <span>Settings</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
