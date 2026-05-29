import * as React from "react"
import {
  CheckIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PlusIcon,
  WaypointsIcon,
  XIcon,
} from "lucide-react"

import { AsciiGhost } from "@/app/pet/ghost/ascii-ghost"
import {
  PET_WINDOW_COMMAND_EVENT,
  PET_WINDOW_READY_EVENT,
  PET_WINDOW_STATE_EVENT,
  type PetWindowCommand,
  type PetWindowState,
} from "@/app/pet/host/pet-window-events"
import {
  resizeCurrentPetWindow,
  savePetWindowPosition,
} from "@/app/pet/host/pet-window"
import {
  type AgentHtmlAgentPromptSubmitInput,
  AgentHtmlPromptComposer,
} from "@/agent-html"

const disabledState: PetWindowState = {
  draftScope: null,
  enabled: false,
}

const PET_WINDOW_COLLAPSED_SIZE = {
  height: 260,
  width: 360,
}

const PET_WINDOW_PANEL_SIZE = {
  height: 520,
  width: 440,
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
  const [isThreadsOpen, setIsThreadsOpen] = React.useState(false)
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
    let unlistenMoved: (() => void) | undefined

    async function attachListener() {
      const { emitTo, listen } = await import("@tauri-apps/api/event")
      const { getCurrentWindow } = await import("@tauri-apps/api/window")
      unlistenState = await listen<PetWindowState>(
        PET_WINDOW_STATE_EVENT,
        (event) => {
          setState(event.payload.enabled ? event.payload : disabledState)
        }
      )
      unlistenMoved = await getCurrentWindow().onMoved((event) => {
        savePetWindowPosition({
          x: event.payload.x,
          y: event.payload.y,
        })
      })
      if (!isDisposed) {
        await emitTo("main", PET_WINDOW_READY_EVENT)
      }
    }

    void attachListener()

    return () => {
      isDisposed = true
      unlistenState?.()
      unlistenMoved?.()
    }
  }, [])

  React.useEffect(() => {
    setMessageDraft("")
    setIsMessageOpen(false)
    setIsThreadsOpen(false)
  }, [state.draftScope])

  React.useEffect(() => {
    void resizeCurrentPetWindow(
      isMessageOpen || isThreadsOpen
        ? PET_WINDOW_PANEL_SIZE
        : PET_WINDOW_COLLAPSED_SIZE
    )
  }, [isMessageOpen, isThreadsOpen])

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
        <div className="relative">
          <button
            aria-label="Message"
            className="px-3 py-2"
            data-tauri-no-drag
            onClick={() => {
              setIsThreadsOpen(false)
              setIsMessageOpen((current) => !current)
            }}
            type="button"
          >
            <AsciiGhost />
          </button>
          <div
            className="absolute top-1/2 left-1/2 size-0"
            data-tauri-no-drag
          >
            <button
              aria-label="Message"
              className="absolute -mt-5 -ml-5 grid size-10 translate-x-16 -translate-y-16 place-items-center rounded-full border border-border/70 bg-background/95 text-muted-foreground shadow-lg shadow-black/15 backdrop-blur hover:border-primary/50 hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                setIsThreadsOpen(false)
                setIsMessageOpen(true)
              }}
              type="button"
            >
              <MessageCircleIcon className="size-4" />
            </button>
            <button
              aria-label="Threads"
              className="absolute -mt-5 -ml-5 grid size-10 -translate-y-22 place-items-center rounded-full border border-border/70 bg-background/95 text-muted-foreground shadow-lg shadow-black/15 backdrop-blur hover:border-primary/50 hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                setIsMessageOpen(false)
                setIsThreadsOpen(true)
              }}
              type="button"
            >
              <WaypointsIcon className="size-4" />
            </button>
          </div>
        </div>
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
        {isThreadsOpen ? (
          <PetWindowThreadPicker
            state={state}
            onClose={() => setIsThreadsOpen(false)}
          />
        ) : null}
      </div>
    </main>
  )
}

function PetWindowThreadPicker({
  onClose,
  state,
}: {
  onClose: () => void
  state: PetWindowState
}) {
  const threads = state.threads
  const [editingThreadId, setEditingThreadId] = React.useState<string | null>(
    null
  )
  const [editingName, setEditingName] = React.useState("")
  const [menuThreadId, setMenuThreadId] = React.useState<string | null>(null)

  return (
    <div
      className="w-86 rounded-md border border-border bg-popover p-3 text-xs shadow-xl"
      data-tauri-no-drag
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-medium">Codex threads</p>
        <button
          className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2 text-[11px] text-muted-foreground hover:bg-muted"
          disabled={!threads?.canSelectThread || threads.isSelectingThread}
          onClick={() => {
            void emitPetCommand({ type: "new-thread" })
            onClose()
          }}
          type="button"
        >
          <PlusIcon className="size-3.5" />
          New
        </button>
      </div>
      {threads?.error ? (
        <p className="mb-2 text-destructive">{threads.error}</p>
      ) : null}
      {!threads?.canSelectThread ? (
        <p className="text-muted-foreground">Connecting to Codex...</p>
      ) : threads.isLoading ? (
        <p className="text-muted-foreground">Loading threads...</p>
      ) : threads.items.length > 0 ? (
        <div className="grid max-h-56 gap-1.5 overflow-y-auto pr-1">
          {threads.items.map((item) => {
            const isEditing = editingThreadId === item.threadId
            const isMenuOpen = menuThreadId === item.threadId

            return (
              <div
                className={[
                  "relative flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-2",
                  item.isCurrentThread
                    ? "border-border bg-background text-foreground"
                    : "border-border/60 bg-transparent hover:bg-muted/50",
                ].join(" ")}
                key={item.threadId}
              >
                {isEditing ? (
                  <form
                    className="flex min-w-0 flex-1 items-center gap-1.5"
                    onSubmit={(event) => {
                      event.preventDefault()
                      const nextName = editingName.trim()
                      if (!nextName) {
                        return
                      }
                      void emitPetCommand({
                        name: nextName,
                        threadId: item.threadId,
                        type: "rename-thread",
                      })
                      setEditingThreadId(null)
                    }}
                  >
                    <input
                      autoFocus
                      className="h-7 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                      onChange={(event) => setEditingName(event.target.value)}
                      value={editingName}
                    />
                    <button
                      aria-label="Save thread name"
                      className="grid size-7 place-items-center rounded-md hover:bg-muted"
                      disabled={!editingName.trim()}
                      type="submit"
                    >
                      <CheckIcon className="size-3.5" />
                    </button>
                    <button
                      aria-label="Cancel rename"
                      className="grid size-7 place-items-center rounded-md hover:bg-muted"
                      onClick={() => setEditingThreadId(null)}
                      type="button"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      aria-current={item.isCurrentThread ? "true" : undefined}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      disabled={threads.isSelectingThread}
                      onClick={() => {
                        void emitPetCommand({
                          threadId: item.threadId,
                          type: "resume-thread",
                        })
                        onClose()
                      }}
                      type="button"
                    >
                      <span className="min-w-0 shrink-0 truncate font-medium">
                        {item.displayName}
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {item.timestamp}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">
                        {item.previewText}
                      </span>
                    </button>
                    <button
                      aria-label="Thread actions"
                      className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      onClick={() =>
                        setMenuThreadId((current) =>
                          current === item.threadId ? null : item.threadId
                        )
                      }
                      type="button"
                    >
                      <MoreHorizontalIcon className="size-3.5" />
                    </button>
                    {isMenuOpen ? (
                      <div className="absolute top-full right-2 z-10 mt-1 grid min-w-32 rounded-md border border-border bg-popover p-1 text-xs shadow-lg">
                        <button
                          className="rounded px-2 py-1.5 text-left hover:bg-muted"
                          onClick={() => {
                            void navigator.clipboard
                              ?.writeText(item.threadId)
                              .catch(() => undefined)
                            setMenuThreadId(null)
                          }}
                          type="button"
                        >
                          Copy thread id
                        </button>
                        <button
                          className="rounded px-2 py-1.5 text-left hover:bg-muted"
                          disabled={threads.isSelectingThread}
                          onClick={() => {
                            setEditingThreadId(item.threadId)
                            setEditingName(item.displayName)
                            setMenuThreadId(null)
                          }}
                          type="button"
                        >
                          Rename
                        </button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No previous threads for this project.
        </p>
      )}
    </div>
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
