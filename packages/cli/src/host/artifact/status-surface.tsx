import type { GuardIssue } from "../host-contracts"
import { HostStatus } from "../ui"

export function GuardIssueList({ issues }: { issues: GuardIssue[] }) {
  if (issues.length === 0) {
    return null
  }

  return (
    <HostStatus.Surface className="canvas-status" title="Guard issues">
      <HostStatus.List>
        {issues.map((issue, index) => (
          <HostStatus.Item
            badge={issue.severity}
            key={`${issue.filePath}:${issue.line ?? 0}:${index}`}
          >
            {issue.message}
          </HostStatus.Item>
        ))}
      </HostStatus.List>
    </HostStatus.Surface>
  )
}

export function HostStatusMessage({
  message,
  title,
}: {
  message: string
  title: string
}) {
  return <HostStatus.Surface message={message} title={title} />
}
