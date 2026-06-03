import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
} from "./host-primitives"
import type { GuardIssue } from "./host-contracts"

export function GuardIssueList({ issues }: { issues: GuardIssue[] }) {
  if (issues.length === 0) {
    return null
  }

  return (
    <Alert className="mb-3">
      <AlertTitle>Guard issues</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-1.5">
          {issues.map((issue, index) => (
            <p
              className="flex min-w-0 items-center gap-2"
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
