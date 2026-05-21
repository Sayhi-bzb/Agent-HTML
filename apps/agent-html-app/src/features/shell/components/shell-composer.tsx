import { SendHorizontalIcon } from "lucide-react"

import {
  ShellIconButton,
  ShellStatusBadge,
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
    <div className="app-shell-composer-row">
      {statusLabel ? (
        <ShellStatusBadge label={statusLabel} variant="outline" />
      ) : null}
      <div className="app-shell-composer-input-shell">
        <ComposerField
          disabled={interactionLocked}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Reply"
          value={draft}
        />
      </div>
      <ShellIconButton
        ariaLabel="Send note"
        className="app-shell-plain-icon app-shell-composer-send"
        disabled={!draft.trim() || interactionLocked}
        onClick={onSend}
        tooltip="Send"
        variant="ghost"
      >
        <SendHorizontalIcon data-icon="inline-start" />
      </ShellIconButton>
    </div>
  )
}
