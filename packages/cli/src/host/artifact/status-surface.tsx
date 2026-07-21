import type { CanvasDiagnostic } from "../host-contracts"
import { useHostI18n } from "../i18n/host-i18n"
import {
  HostStatusDetails,
  HostStatusItem,
  HostStatusList,
  HostStatusSurface,
} from "../ui/status"

export function ValidationIssueList({ diagnostics }: { diagnostics: CanvasDiagnostic[] }) {
  const { t } = useHostI18n()

  if (diagnostics.length === 0) {
    return null
  }

  return (
    <HostStatusSurface className="canvas-status" title={t("artifact.validationIssues")}>
      <HostStatusList>
        {diagnostics.map((diagnostic, index) => (
          <HostStatusItem
            badge={diagnostic.code}
            key={`${diagnostic.filePath}:${diagnostic.line}:${index}`}
          >
            {diagnostic.message}
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
