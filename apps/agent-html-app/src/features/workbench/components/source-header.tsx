import {
  ShellActionButton,
  ShellCardHeader,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"

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
          <ShellActionButton disabled={interactionLocked} onClick={onValidate}>
            Check
          </ShellActionButton>
          <ShellActionButton
            disabled={!hasUnsavedChanges || interactionLocked}
            onClick={onSaveSource}
          >
            Save
          </ShellActionButton>
        </>
      }
      title="Source"
      titleSize="sm"
    />
  )
}
