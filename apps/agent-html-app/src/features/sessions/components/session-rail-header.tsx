import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type SessionRailHeaderProps = {
  query: string
  disabled: boolean
  onCreateSession: () => void
  onQueryChange: (value: string) => void
}

export function SessionRailHeader({
  query,
  disabled,
  onCreateSession,
  onQueryChange,
}: SessionRailHeaderProps) {
  return (
    <SidebarGroup className="app-shell-session-sidebar-group">
      <SidebarGroupLabel>Sessions</SidebarGroupLabel>
      <SidebarGroupContent className="app-shell-section-stack">
        <div className="app-shell-sidebar-search">
          <SearchIcon className="app-shell-sidebar-search-icon" />
          <Input
            className="app-shell-sidebar-search-input"
            disabled={disabled}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Find"
            value={query}
          />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              aria-label="Create session"
              className="app-shell-session-command-item"
              disabled={disabled}
              onClick={onCreateSession}
              type="button"
            >
              <span>New session</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
