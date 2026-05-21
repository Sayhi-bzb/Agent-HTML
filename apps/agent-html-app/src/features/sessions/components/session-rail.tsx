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
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              value={query}
            />
          </div>
          <Button onClick={onCreateSession} size="icon-sm" type="button" variant="outline">
            <PlusIcon />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid gap-2 p-3">
          {filtered.map((session) => {
            const isActive = session.id === activeSessionId
            return (
              <button
                className="text-left"
                key={session.id}
                onClick={() => onOpenSession(session.id)}
                type="button"
              >
                <Card className={isActive ? "border-primary" : ""} size="sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="truncate">{session.name}</CardTitle>
                      <Badge variant={isActive ? "default" : "outline"}>
                        {session.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestampLabel(session.updatedAt)}
                    </span>
                    <Button
                      aria-label="Delete session"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      size="icon-xs"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon />
                    </Button>
                  </CardFooter>
                </Card>
              </button>
            )
          })}
          {filtered.length === 0 ? (
            <Card size="sm">
              <CardContent className="py-6 text-xs text-muted-foreground">
                No sessions
              </CardContent>
            </Card>
          ) : null}
          {loading ? (
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <LoaderCircleIcon className="size-3.5 animate-spin" />
              Loading
            </div>
          ) : null}
        </div>
      </ScrollArea>
      <div className="border-t p-3">
        <Button size="icon-sm" type="button" variant="ghost">
          <Settings2Icon />
        </Button>
      </div>
    </div>
  )
}
