import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#agent-html-playground/ui/alert"
import { Badge } from "#agent-html-playground/ui/badge"
import type { GuardIssue } from "./host-contracts"

export function GuardIssueList({ issues }: { issues: GuardIssue[] }) {
  if (issues.length === 0) {
    return null
  }

  return (
    <Alert className="canvas-status">
      <AlertTitle>Guard issues</AlertTitle>
      <AlertDescription>
        <div className="canvas-status-stack">
          {issues.map((issue, index) => (
            <p
              className="canvas-status-item"
              key={`${issue.filePath}:${issue.line ?? 0}:${index}`}
            >
              <Badge className="shrink-0" variant="secondary">
                {issue.severity}
              </Badge>
              <span className="min-w-0 truncate">{issue.message}</span>
            </p>
          ))}
        </div>
      </AlertDescription>
    </Alert>
  )
}

export function HostStatusMessage({
  message,
  title,
}: {
  message: string
  title: string
}) {
  return (
    <Alert>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
