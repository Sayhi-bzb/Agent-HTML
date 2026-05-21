import type { ComponentProps } from "react"

import { Textarea } from "@/components/ui/textarea"
import {
  ShellLoadingRow,
  ShellStatusRow,
} from "@/features/app-shell/components/shell-content"
import type { SourceValidationSnapshot } from "@/lib/types"
import { cn } from "@/lib/utils"

type SourceEditorFieldProps = ComponentProps<typeof Textarea>

export function SourceEditorField({
  className,
  ...props
}: SourceEditorFieldProps) {
  return <Textarea className={cn("app-shell-editor-field", className)} {...props} />
}

type SourceValidationSummaryProps = {
  validating: boolean
  validation?: SourceValidationSnapshot
}

export function SourceValidationSummary({
  validating,
  validation,
}: SourceValidationSummaryProps) {
  const invalidCount =
    validation?.status === "invalid" ? validation.diagnostics.length : 0

  return (
    <ShellStatusRow>
      {validating ? (
        <ShellLoadingRow>Check</ShellLoadingRow>
      ) : invalidCount > 0 ? (
        <>
          <span className="app-shell-supporting-copy">Issue</span>
          <span className="app-shell-status-count">{invalidCount}</span>
        </>
      ) : null}
    </ShellStatusRow>
  )
}
