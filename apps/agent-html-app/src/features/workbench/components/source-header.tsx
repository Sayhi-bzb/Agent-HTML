import { Button } from "@/components/ui/button"
import {
  ShellCardHeader,
  ShellStatusBadge,
} from "@/features/app-shell/components/shell-content"

type SourceHeaderProps = {
  sourcePath: string
  hasUnsavedChanges: boolean
  interactionLocked: boolean
  onSaveSource: () => void
  onValidate: () => void
}

export function SourceHeader({
  sourcePath,
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
      description={sourcePath}
      title="Source"
    />
  )
}
