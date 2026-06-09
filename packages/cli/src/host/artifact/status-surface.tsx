import type { GuardIssue } from "../host-contracts"
import { useHostI18n } from "../i18n/host-i18n"
import {
  HostStatusItem,
  HostStatusList,
  HostStatusSurface,
} from "../ui/status"

export function GuardIssueList({ issues }: { issues: GuardIssue[] }) {
  const { t } = useHostI18n()

  if (issues.length === 0) {
    return null
  }

  return (
    <HostStatusSurface className="canvas-status" title={t("artifact.guardIssues")}>
      <HostStatusList>
        {issues.map((issue, index) => (
          <HostStatusItem
            badge={issue.severity}
            key={`${issue.filePath}:${issue.line ?? 0}:${index}`}
          >
            {issue.message}
          </HostStatusItem>
        ))}
      </HostStatusList>
    </HostStatusSurface>
  )
}

export function HostStatusMessage({
  message,
  title,
}: {
  message: string
  title: string
}) {
  return <HostStatusSurface message={message} title={title} />
}
