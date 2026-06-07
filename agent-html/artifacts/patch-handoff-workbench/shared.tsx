import { Badge } from "../../components/ui/badge"

import type { ReviewStatus, Severity } from "./data"

export function severityVariant(severity: Severity) {
  if (severity === "Critical") {
    return "destructive"
  }

  if (severity === "High") {
    return "default"
  }

  return severity === "Medium" ? "secondary" : "outline"
}

export function statusVariant(status: ReviewStatus | string) {
  if (status === "Blocked" || status === "Open") {
    return "destructive"
  }

  if (status === "Needs human" || status === "Investigating") {
    return "secondary"
  }

  return status === "Ready" || status === "Fixed" ? "default" : "outline"
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge variant={severityVariant(severity)}>{severity}</Badge>
}

export function StatusBadge({ status }: { status: ReviewStatus | string }) {
  return <Badge variant={statusVariant(status)}>{status}</Badge>
}

export function CountBadge({ count, label }: { count: number; label: string }) {
  return (
    <Badge variant="outline">
      {count} {label}
    </Badge>
  )
}

export function WorkbenchHeader({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="canvas-stack-sm">
      <h2 className="canvas-text-heading">{title}</h2>
      <p className="canvas-text-body text-muted-foreground">{children}</p>
    </div>
  )
}
