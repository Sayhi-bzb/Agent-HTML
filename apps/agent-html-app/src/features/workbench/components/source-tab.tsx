import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { SessionDetail, SourceValidationSnapshot } from "@/lib/types"

import {
  ShellCardHeader,
  ShellLoadingRow,
  ShellStatusRow,
  ShellStatusBadge,
  ShellValidationStatusBadge,
  ShellWorkbenchCard,
} from "@/features/app-shell/components/shell-content"

type SourceTabProps = {
  session: SessionDetail
  draftSource: string
  hasUnsavedChanges: boolean
  interactionLocked: boolean
  sourceEditingLocked: boolean
  saving: boolean
  validating: boolean
  validation?: SourceValidationSnapshot
  onSaveSource: () => void
  onValidate: () => void
  onDraftSourceChange: (source: string) => void
}

export function SourceTab({
  session,
  draftSource,
  hasUnsavedChanges,
  interactionLocked,
  sourceEditingLocked,
  saving,
  validating,
  validation,
  onSaveSource,
  onValidate,
  onDraftSourceChange,
}: SourceTabProps) {
  return (
    <ShellWorkbenchCard
      header={
        <ShellCardHeader
          actionClassName="app-shell-stack-compact"
          action={
            <>
              {hasUnsavedChanges ? (
                <ShellStatusBadge label="dirty" variant="outline" />
              ) : null}
              <Button
                disabled={interactionLocked}
                onClick={onValidate}
                size="sm"
                type="button"
                variant="outline"
              >
                Validate
              </Button>
              <Button
                disabled={!hasUnsavedChanges || interactionLocked}
                onClick={onSaveSource}
                size="sm"
                type="button"
              >
                Save
              </Button>
            </>
          }
          description={session.sourcePath}
          title="Source"
        />
      }
    >
      {saving ? <ShellLoadingRow>Saving source</ShellLoadingRow> : null}
      <Textarea
        className="app-shell-editor-field"
        disabled={sourceEditingLocked}
        onChange={(event) => onDraftSourceChange(event.target.value)}
        value={draftSource}
      />
      <ShellStatusRow>
        {validating ? (
          <ShellLoadingRow>Validating</ShellLoadingRow>
        ) : validation ? (
          <>
            <ShellValidationStatusBadge status={validation.status} />
            <span>{validation.structureSummary}</span>
          </>
        ) : null}
      </ShellStatusRow>
    </ShellWorkbenchCard>
  )
}
