import type { SessionSummary } from "@/lib/types"

export function filterSessions(
  sessions: SessionSummary[],
  query: string,
): SessionSummary[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return sessions
  }

  return sessions.filter((session) => {
    return (
      session.name.toLowerCase().includes(normalized) ||
      session.directory.toLowerCase().includes(normalized)
    )
  })
}
