import { useMemo, useState } from "react"
import {
  LoaderCircleIcon,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatTimestampLabel } from "@/lib/time"
import type { SessionSummary } from "@/lib/types"

import { filterSessions } from "../lib/filter-sessions"

export type SessionRailProps = {
  sessions: SessionSummary[]
  activeSessionId: string
  loading: boolean
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
  onOpenSession: (sessionId: string) => void
}

export function SessionRail({
  sessions,
  activeSessionId,
  loading,
  onCreateSession,
  onDeleteSession,
  onOpenSession,
}: SessionRailProps) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => filterSessions(sessions, query), [query, sessions])

  return (
    <div className="app-shell-pane">
      <div className="app-shell-pane-header">
        <div className="app-shell-stack-compact">
          <div className="app-shell-search-field">
            <SearchIcon className="app-shell-search-icon" />
            <Input
              className="app-shell-search-input"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              value={query}
            />
          </div>
          <Button
            aria-label="Create session"
            onClick={onCreateSession}
            size="icon-sm"
            type="button"
            variant="outline"
          >
            <PlusIcon data-icon="inline-start" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="app-shell-surface-grid app-shell-card-inset">
          {filtered.map((session) => {
            const isActive = session.id === activeSessionId
            return (
              <Card
                className={cn("app-shell-session-card", isActive && "app-shell-card-active")}
                key={session.id}
                size="sm"
              >
                <button
                  aria-label={`Open session ${session.name}`}
                  className="app-shell-session-card-trigger"
                  onClick={() => onOpenSession(session.id)}
                  type="button"
                />
                <CardHeader>
                  <div className="app-shell-split-row app-shell-split-row-start">
                    <CardTitle className="truncate">{session.name}</CardTitle>
                    <Badge variant={isActive ? "default" : "outline"}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardFooter className="app-shell-metric-row">
                  <span className="app-shell-supporting-copy">
                    {formatTimestampLabel(session.updatedAt)}
                  </span>
                  <Button
                    aria-label="Delete session"
                    className="app-shell-session-card-action"
                    onClick={() => onDeleteSession(session.id)}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2Icon data-icon="inline-start" />
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
          {filtered.length === 0 ? (
            <Card size="sm">
              <CardContent className="app-shell-empty-state app-shell-supporting-copy">
                No sessions
              </CardContent>
            </Card>
          ) : null}
          {loading ? (
            <div className="app-shell-loading-row">
              <LoaderCircleIcon className="app-shell-spinner" />
              Loading
            </div>
          ) : null}
        </div>
      </ScrollArea>
      <div className="app-shell-pane-footer">
        <Button aria-label="Session settings" size="icon-sm" type="button" variant="ghost">
          <Settings2Icon data-icon="inline-start" />
        </Button>
      </div>
    </div>
  )
}
