import type { BuildRunSummary } from "@/lib/types"

import {
  ShellBuildStatusBadge,
  ShellCardHeader,
} from "@/features/app-shell/components/shell-content"

type PreviewHeaderProps = {
  build: BuildRunSummary
}

export function PreviewHeader({ build }: PreviewHeaderProps) {
  return (
    <ShellCardHeader
      action={<ShellBuildStatusBadge status={build.status} />}
      title="Preview"
      titleSize="sm"
    />
  )
}
