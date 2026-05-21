import {
  ShellActionButton,
  ShellCardHeader,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"
import { CheckIcon, SaveIcon } from "lucide-react"

type SourceHeaderProps = {
  hasUnsavedChanges: boolean
  interactionLocked: boolean
  onSaveSource: () => void
  onValidate: () => void
}

export function SourceHeader({
  hasUnsavedChanges,
  interactionLocked,
  onSaveSource,
  onValidate,
}: SourceHeaderProps) {
  return (
    <ShellCardHeader
      actionLayout="compact"
      action={
        <>
          {hasUnsavedChanges ? (
            <ShellStatusBadge label="edit" variant="outline" />
          ) : null}
          <ShellActionButton
            ariaLabel="Check source"
            className="app-shell-plain-action"
            disabled={interactionLocked}
            onClick={onValidate}
            variant="ghost"
          >
            <CheckIcon data-icon="inline-start" />
            Check
          </ShellActionButton>
          {hasUnsavedChanges ? (
            <ShellActionButton
              ariaLabel="Save source"
              className="app-shell-plain-action"
              disabled={interactionLocked}
              onClick={onSaveSource}
              variant="ghost"
            >
              <SaveIcon data-icon="inline-start" />
              Save
            </ShellActionButton>
          ) : null}
        </>
      }
      title="Source"
      titleSize="sm"
    />
  )
}
