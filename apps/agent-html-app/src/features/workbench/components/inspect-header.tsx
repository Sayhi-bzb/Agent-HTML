import type { InspectSnapshot } from "@/lib/types"

import {
  ShellCardHeader,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"

type InspectHeaderProps = {
  inspect: InspectSnapshot
}

export function InspectHeader({ inspect }: InspectHeaderProps) {
  const diagnosticsCount = inspect.diagnostics.filter((item) => item.severity !== "info").length

  return (
    <ShellCardHeader
      action={diagnosticsCount > 0 ? <ShellStatusBadge label={`${diagnosticsCount}`} variant="outline" /> : null}
      title="Inspect"
      titleSize="sm"
    />
  )
}
