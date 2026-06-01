import { RotateCwIcon, SaveIcon } from "lucide-react"

import type { AgentsInstructionsSource } from "@/app/pet/host/agents-instructions-loader"
import { Button } from "@/app/shared/ui/button"
import { Spinner } from "@/app/shared/ui/spinner"
import { Textarea } from "@/app/shared/ui/textarea"
import { SettingsInfoPanel } from "@/app/shell/settings-surface"

import { SettingsFormSkeleton } from "./settings-shared"

export function AgentsMdView({
  draft,
  error,
  isDirty,
  isLoading,
  isSaving,
  loadInstructions,
  path,
  saveInstructions,
  setDraft,
  source,
  status,
}: {
  draft: string
  error: string | null
  isDirty: boolean
  isLoading: boolean
  isSaving: boolean
  loadInstructions: () => Promise<void> | void
  path: string | null
  saveInstructions: () => void
  setDraft: (draft: string) => void
  source: AgentsInstructionsSource | null
  status: "idle" | "saved"
}) {
  if (isLoading) {
    return <SettingsFormSkeleton />
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-0 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <label
            className="text-xs font-medium text-muted-foreground"
            data-selection="none"
            htmlFor="pet-agent-instructions"
          >
            Project instructions
          </label>
          <span
            className="text-xs text-muted-foreground"
            data-cursor="text"
            data-selection="text"
            title={path ?? "AGENTS.md"}
          >
            {isDirty ? "Unsaved" : path ?? "AGENTS.md"}
          </span>
        </div>
        <Textarea
          aria-label="AgentHTML AGENTS.md content"
          className="h-72 min-h-0 resize-none overflow-auto font-mono text-xs leading-relaxed"
          disabled={isLoading || isSaving}
          id="pet-agent-instructions"
          onChange={(event) => {
            setDraft(event.target.value)
          }}
          placeholder="Loading AGENTS.md..."
          spellCheck={false}
          value={isLoading ? "" : draft}
        />
      </div>
      {error ? (
        <SettingsInfoPanel variant="destructive">{error}</SettingsInfoPanel>
      ) : null}
      {!error && status === "saved" ? (
        <SettingsInfoPanel>
          {source === "workspace" ? "Saved locally." : "Saved."}
        </SettingsInfoPanel>
      ) : null}
      <footer
        className="flex shrink-0 items-center justify-end gap-2"
        data-selection="none"
      >
        <Button
          disabled={isLoading || isSaving}
          onClick={loadInstructions}
          size="sm"
          type="button"
          variant="outline"
        >
          <RotateCwIcon aria-hidden="true" className="size-3.5" />
          Reload
        </Button>
        <Button
          disabled={isLoading || isSaving || !isDirty}
          onClick={saveInstructions}
          size="sm"
          type="button"
        >
          {isSaving ? (
            <Spinner className="size-3.5" />
          ) : (
            <SaveIcon aria-hidden="true" className="size-3.5" />
          )}
          {isSaving ? "Saving" : "Save"}
        </Button>
      </footer>
    </div>
  )
}
