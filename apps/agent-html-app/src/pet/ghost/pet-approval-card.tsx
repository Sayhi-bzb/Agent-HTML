import type {
  CodexApprovalDecision,
  CodexApprovalRequest,
} from "@/app/codex/connection/types"

function decisionLabel(decision: CodexApprovalDecision) {
  if (decision === "accept") {
    return "Allow"
  }
  if (decision === "acceptForSession") {
    return "Allow for session"
  }
  if (decision === "decline") {
    return "Deny"
  }
  return "Cancel"
}

function primaryDetail(approval: CodexApprovalRequest) {
  if (approval.networkTarget) {
    return approval.networkTarget
  }

  if (approval.command) {
    return approval.command
  }

  if (approval.cwd) {
    return approval.cwd
  }

  return approval.reason ?? null
}

export function PetApprovalCard({
  approval,
  error,
  onRespond,
}: {
  approval: CodexApprovalRequest
  error?: string | null
  onRespond?: (decision: CodexApprovalDecision) => void
}) {
  const detail = primaryDetail(approval)
  const isResponding = approval.status === "responding"
  const decisions = approval.availableDecisions.length
    ? approval.availableDecisions
    : (["accept", "decline", "cancel"] satisfies CodexApprovalDecision[])

  return (
    <div className="pointer-events-auto w-[min(24rem,calc(100vw-2rem))] rounded-lg border border-border/80 bg-background/95 p-3 text-left shadow-lg backdrop-blur">
      <div className="space-y-1">
        <div className="text-xs font-semibold text-foreground">
          {approval.title}
        </div>
        {detail ? (
          <div className="max-h-24 overflow-auto rounded-md bg-muted/60 px-2 py-1.5 font-mono text-[11px] leading-relaxed break-words whitespace-pre-wrap text-muted-foreground">
            {detail}
          </div>
        ) : null}
        {approval.reason && approval.reason !== detail ? (
          <div className="text-[11px] leading-relaxed text-muted-foreground">
            {approval.reason}
          </div>
        ) : null}
        {approval.cwd && approval.cwd !== detail ? (
          <div className="truncate text-[10px] text-muted-foreground">
            {approval.cwd}
          </div>
        ) : null}
        {error ? (
          <div className="text-[11px] leading-relaxed text-destructive">
            {error}
          </div>
        ) : null}
      </div>
      <div className="mt-3 flex flex-wrap justify-end gap-1.5">
        {decisions.map((decision) => (
          <button
            className={[
              "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors disabled:opacity-60",
              decision === "accept" || decision === "acceptForSession"
                ? "border-primary/30 bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            ].join(" ")}
            disabled={isResponding}
            key={decision}
            onClick={() => onRespond?.(decision)}
            type="button"
          >
            {isResponding ? "Sending..." : decisionLabel(decision)}
          </button>
        ))}
      </div>
    </div>
  )
}
