import type { GuardIssue } from "../host-contracts"
import { useHostI18n } from "../i18n/host-i18n"
import {
  HostStatusDetails,
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
  context,
  details,
  detailsLabel,
  message,
  title,
}: {
  context?: string
  details?: string
  detailsLabel?: string
  message: string
  title: string
}) {
  return (
    <HostStatusSurface title={title}>
      <div className="canvas-status-summary">{message}</div>
      {context ? <div className="canvas-status-context">{context}</div> : null}
      {details && detailsLabel ? (
        <HostStatusDetails label={detailsLabel}>{details}</HostStatusDetails>
      ) : null}
    </HostStatusSurface>
  )
}
