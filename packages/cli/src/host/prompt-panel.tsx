import * as React from "react"

import { Button, Input } from "./ui"
import type { PromptTarget } from "./types"

export function PromptPanel({
  activeFilePath,
  onClose,
  onSubmit,
  output,
  status,
  target,
}: {
  activeFilePath: string | null
  onClose: () => void
  onSubmit: (request: string) => void
  output: string
  status: string
  target: PromptTarget
}) {
  const [draft, setDraft] = React.useState(target.initialRequest ?? "")

  React.useEffect(() => {
    setDraft(target.initialRequest ?? "")
  }, [target])

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col gap-4 border-l border-border bg-background py-4">
      <div className="grid gap-1 px-4">
        <h2 className="truncate text-sm font-semibold">{target.title}</h2>
        <p className="truncate text-sm text-muted-foreground">
          {activeFilePath ?? "No active artifact"}
        </p>
      </div>
      <form
        className="flex gap-2 px-4"
        onSubmit={(event) => {
          event.preventDefault()
          const request = draft.trim()
          if (request) {
            onSubmit(request)
          }
        }}
      >
        <Input
          autoFocus
          onChange={(event) => setDraft(event.currentTarget.value)}
          placeholder="Ask the agent to update this block..."
          value={draft}
        />
        <Button disabled={!draft.trim()} type="submit">
          Send
        </Button>
      </form>
      {status ? (
        <p className="px-4 text-xs text-muted-foreground">{status}</p>
      ) : null}
      {output ? (
        <pre className="mx-4 max-h-80 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
          {output}
        </pre>
      ) : null}
      <div className="mt-auto flex justify-end px-4">
        <Button onClick={onClose} type="button" variant="outline">
          Close
        </Button>
      </div>
    </div>
  )
}
