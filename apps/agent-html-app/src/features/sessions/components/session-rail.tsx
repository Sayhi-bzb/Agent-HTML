import { useMemo, useState } from "react"
import { Settings2Icon } from "lucide-react"

import type { SessionSummary } from "@/lib/types"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  ShellEmptyCard,
  ShellLoadingRow,
  ShellScrollSurface,
} from "@/features/app-shell/components/shell-content"
import { filterSessions } from "../lib/filter-sessions"
import { SessionCard } from "./session-card"
import { SessionRailHeader } from "./session-rail-header"

type SessionRailProps = {
  sessions: SessionSummary[]
  activeSessionId: string
  loading: boolean
  disabled: boolean
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
  onOpenSession: (sessionId: string) => void
  onRenameSession: (sessionId: string, name: string) => void
}

export function SessionRail({
  sessions,
  activeSessionId,
  loading,
  disabled,
  onCreateSession,
  onDeleteSession,
  onOpenSession,
  onRenameSession,
}: SessionRailProps) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => filterSessions(sessions, query), [query, sessions])

  return (
    <Sidebar className="app-shell-session-sidebar">
      <SidebarHeader className="app-shell-session-sidebar-header">
        <SessionRailHeader
          disabled={disabled}
          onCreateSession={onCreateSession}
          onQueryChange={setQuery}
          query={query}
        />
      </SidebarHeader>
      <SidebarContent className="app-shell-session-sidebar-content">
        <ShellScrollSurface className="app-shell-session-sidebar-scroll">
          <SidebarMenu className="app-shell-divider-list">
            {filtered.map((session) => (
              <SessionCard
                active={session.id === activeSessionId}
                disabled={disabled}
                key={session.id}
                onDelete={onDeleteSession}
                onOpen={onOpenSession}
                onRename={onRenameSession}
                session={session}
              />
            ))}
          </SidebarMenu>
          {filtered.length === 0 ? <ShellEmptyCard className="app-shell-flat-card">Empty</ShellEmptyCard> : null}
          {loading ? <ShellLoadingRow>Load</ShellLoadingRow> : null}
        </ShellScrollSurface>
      </SidebarContent>
      <SidebarFooter className="app-shell-session-sidebar-footer">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              aria-label="Settings"
              className="app-shell-session-command-item"
              disabled
              type="button"
            >
              <Settings2Icon data-icon="inline-start" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
