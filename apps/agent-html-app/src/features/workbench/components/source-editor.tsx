import type { ComponentProps } from "react"

import { Textarea } from "@/components/ui/textarea"
import {
  ShellLoadingRow,
  ShellStatusRow,
  ShellValidationStatusBadge,
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
  return (
    <ShellStatusRow>
      {validating ? (
        <ShellLoadingRow>Check</ShellLoadingRow>
      ) : validation ? (
        <>
          <ShellValidationStatusBadge status={validation.status} />
          {validation.status === "invalid" ? <span>{validation.diagnostics.length}</span> : null}
        </>
      ) : null}
    </ShellStatusRow>
  )
}
