import type { SourceValidationSnapshot } from "@/lib/types"

import {
  ShellLoadingRow,
} from "@/features/app-shell/components/shell-content"
import { SourceHeader } from "./source-header"
import {
  SourceEditorField,
  SourceValidationSummary,
} from "./source-editor"
import { WorkbenchCard } from "./workbench-card"

type SourceTabProps = {
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
    <WorkbenchCard
      header={
        <SourceHeader
          hasUnsavedChanges={hasUnsavedChanges}
          interactionLocked={interactionLocked}
          onSaveSource={onSaveSource}
          onValidate={onValidate}
        />
      }
    >
      {saving ? <ShellLoadingRow>Save</ShellLoadingRow> : null}
      <SourceEditorField
        disabled={sourceEditingLocked}
        onChange={(event) => onDraftSourceChange(event.target.value)}
        value={draftSource}
      />
      <SourceValidationSummary validating={validating} validation={validation} />
    </WorkbenchCard>
  )
}
