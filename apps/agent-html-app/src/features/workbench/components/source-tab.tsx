import type { SourceValidationSnapshot } from "@/lib/types"

import {
  ShellIconButton,
  ShellLoadingRow,
  ShellMetaRow,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { CheckIcon, SaveIcon } from "lucide-react"
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
    <WorkbenchCard>
      <ShellMetaRow
        action={
          <div className="app-shell-stack-compact">
            {hasUnsavedChanges ? (
              <ShellStatusBadge label="edit" variant="outline" />
            ) : null}
            <ShellIconButton
              ariaLabel="Check source"
              disabled={interactionLocked}
              onClick={onValidate}
              tooltip="Check"
            >
              <CheckIcon data-icon="inline-start" />
            </ShellIconButton>
            {hasUnsavedChanges ? (
              <ShellIconButton
                ariaLabel="Save source"
                disabled={interactionLocked}
                onClick={onSaveSource}
                tooltip="Save"
              >
                <SaveIcon data-icon="inline-start" />
              </ShellIconButton>
            ) : null}
          </div>
        }
      />
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
