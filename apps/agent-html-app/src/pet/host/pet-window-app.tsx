import * as React from "react"

import { AsciiGhost } from "@/app/pet/ghost/ascii-ghost"
import {
  PET_WINDOW_COMMAND_EVENT,
  PET_WINDOW_READY_EVENT,
  PET_WINDOW_STATE_EVENT,
  type PetWindowCommand,
  type PetWindowState,
} from "@/app/pet/host/pet-window-events"
import {
  type AgentHtmlAgentPromptSubmitInput,
  AgentHtmlPromptComposer,
} from "@/agent-html"

const disabledState: PetWindowState = {
  draftScope: null,
  enabled: false,
}

function getPresenceMessage(state: PetWindowState) {
  if (state.presence?.message?.text) {
    return state.presence.message.text
  }

  if (state.presence?.mood === "waiting") {
    return "waiting for input"
  }

  if (state.presence?.mood === "failed") {
    return "something needs attention"
  }

  if (state.presence?.mood === "review") {
    return "ready for review"
  }

  return "watching this canvas"
}

async function emitPetCommand(command: PetWindowCommand) {
  const { emitTo } = await import("@tauri-apps/api/event")
  await emitTo("main", PET_WINDOW_COMMAND_EVENT, command)
}

export function PetWindowApp() {
  const [state, setState] = React.useState<PetWindowState>(disabledState)
  const [isMessageOpen, setIsMessageOpen] = React.useState(false)
  const [messageDraft, setMessageDraft] = React.useState("")

  React.useEffect(() => {
    document.documentElement.dataset.agentWindow = "pet"

    return () => {
      delete document.documentElement.dataset.agentWindow
    }
  }, [])

  React.useEffect(() => {
    let isDisposed = false
    let unlistenState: (() => void) | undefined

    async function attachListener() {
      const { emitTo, listen } = await import("@tauri-apps/api/event")
      unlistenState = await listen<PetWindowState>(
        PET_WINDOW_STATE_EVENT,
        (event) => {
          setState(event.payload.enabled ? event.payload : disabledState)
        }
      )
      if (!isDisposed) {
        await emitTo("main", PET_WINDOW_READY_EVENT)
      }
    }

    void attachListener()

    return () => {
      isDisposed = true
      unlistenState?.()
    }
  }, [])

  React.useEffect(() => {
    setMessageDraft("")
    setIsMessageOpen(false)
  }, [state.draftScope])

  if (!state.enabled) {
    return null
  }

  return (
    <main className="grid h-svh place-items-center bg-transparent p-3">
      <div
        className="flex flex-col items-center gap-2 text-foreground"
        data-tauri-drag-region
      >
        <div className="max-w-60 rounded-full bg-background/95 px-3 py-1.5 text-center text-[11px] font-medium whitespace-nowrap text-muted-foreground backdrop-blur">
          {getPresenceMessage(state)}
        </div>
        <button
          aria-label="Message"
          className="px-3 py-2"
          data-tauri-no-drag
          onClick={() => setIsMessageOpen((current) => !current)}
          type="button"
        >
          <AsciiGhost />
        </button>
        {isMessageOpen ? (
          <div
            className="w-80 overflow-hidden rounded-md border border-border bg-popover shadow-xl"
            data-tauri-no-drag
          >
            <PetWindowMessageComposer
              draft={messageDraft}
              onDraftChange={setMessageDraft}
              onMessageOpenChange={setIsMessageOpen}
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}

function PetWindowMessageComposer({
  draft,
  onDraftChange,
  onMessageOpenChange,
}: {
  draft: string
  onDraftChange: (draft: string) => void
  onMessageOpenChange: (open: boolean) => void
}) {
  return (
    <AgentHtmlPromptComposer
      onSend={(prompt: AgentHtmlAgentPromptSubmitInput["prompt"]) => {
        onDraftChange("")
        void emitPetCommand({
          prompt,
          type: "send-prompt",
        })
        onMessageOpenChange(false)
      }}
      onValueChange={onDraftChange}
      value={draft}
    />
  )
}
