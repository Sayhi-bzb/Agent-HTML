import type { InspectSnapshot } from "@/lib/types"

import {
  ShellCardHeader,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"

type InspectHeaderProps = {
  inspect: InspectSnapshot
}

export function InspectHeader({ inspect }: InspectHeaderProps) {
  return (
    <ShellCardHeader
      action={
        <ShellStatusBadge
          label={`${inspect.diagnostics.length}`}
          variant="outline"
        />
      }
      title="Inspect"
      titleSize="sm"
    />
  )
}
