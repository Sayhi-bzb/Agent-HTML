import * as React from "react"

import { Button } from "#agent-html-playground/ui/button"
import { Input } from "#agent-html-playground/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "#agent-html-playground/ui/sheet"

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
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="truncate">{target.title}</SheetTitle>
          <SheetDescription className="truncate">
            {activeFilePath ?? "No active artifact"}
          </SheetDescription>
        </SheetHeader>
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
        <SheetFooter>
          <Button onClick={onClose} type="button" variant="outline">
            Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
