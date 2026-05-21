import {
  ShellActionButton,
  ShellMetaRow,
} from "@/features/app-shell/components/shell-content"
import { ComposerField } from "./composer-field"

type ShellComposerProps = {
  draft: string
  interactionLocked: boolean
  statusLabel?: string
  onDraftChange: (value: string) => void
  onSend: () => void
}

export function ShellComposer({
  draft,
  interactionLocked,
  statusLabel,
  onDraftChange,
  onSend,
}: ShellComposerProps) {
  return (
    <div className="app-shell-surface-grid">
      <ComposerField
        disabled={interactionLocked}
        onChange={(event) => onDraftChange(event.target.value)}
        placeholder="..."
        value={draft}
      />
      <ShellMetaRow
        action={
          <ShellActionButton
            disabled={!draft.trim() || interactionLocked}
            onClick={onSend}
          >
            Send
          </ShellActionButton>
        }
        copy={statusLabel}
      />
    </div>
  )
}
