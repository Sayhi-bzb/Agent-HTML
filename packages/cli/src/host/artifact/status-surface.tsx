import type { GuardIssue } from "../host-contracts"
import { HostFeedback } from "../ui"

export function GuardIssueList({ issues }: { issues: GuardIssue[] }) {
  if (issues.length === 0) {
    return null
  }

  return (
    <HostFeedback.Status className="canvas-status" title="Guard issues">
      <HostFeedback.StatusList>
        {issues.map((issue, index) => (
          <HostFeedback.StatusItem
            badge={issue.severity}
            key={`${issue.filePath}:${issue.line ?? 0}:${index}`}
          >
            {issue.message}
          </HostFeedback.StatusItem>
        ))}
      </HostFeedback.StatusList>
    </HostFeedback.Status>
  )
}

export function HostStatusMessage({
  message,
  title,
}: {
  message: string
  title: string
}) {
  return <HostFeedback.Status message={message} title={title} />
}
