import {
  ShellCardHeader,
  ShellIconButton,
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
          <ShellIconButton
            ariaLabel="Check source"
            className="app-shell-plain-icon"
            disabled={interactionLocked}
            onClick={onValidate}
            tooltip="Check"
            variant="ghost"
          >
            <CheckIcon data-icon="inline-start" />
          </ShellIconButton>
          {hasUnsavedChanges ? (
            <ShellIconButton
              ariaLabel="Save source"
              className="app-shell-plain-icon"
              disabled={interactionLocked}
              onClick={onSaveSource}
              tooltip="Save"
              variant="ghost"
            >
              <SaveIcon data-icon="inline-start" />
            </ShellIconButton>
          ) : null}
        </>
      }
      title="Source"
      titleSize="sm"
    />
  )
}
