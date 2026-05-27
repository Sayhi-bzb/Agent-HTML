import type * as React from "react"

const GHOST_GLYPH_ROWS = [
  "╭──────╮",
  "│ █  █ │",
  "│      │",
  "│╭╮╭╮╭╮│",
  "╰╯╰╯╰╯╰╯",
] as const

const GHOST_CELL_WIDTH = "0.4rem"
const GHOST_CELL_HEIGHT = "0.9rem"

export type PetMood = "failed" | "idle" | "review" | "waiting" | "working"

export type PetActionKind =
  | "editing"
  | "reading"
  | "running"
  | "searching"
  | "speaking"
  | "testing"
  | "thinking"
  | "waiting"

export type PetPresence = {
  action?: {
    kind: PetActionKind
    label: string
  }
  message?: {
    mode: "final" | "streaming" | "transient"
    text: string
  }
  mood: PetMood
}

const idlePresence: PetPresence = {
  message: {
    mode: "transient",
    text: "watching this canvas",
  },
  mood: "idle",
}

function getPresenceMessage(presence: PetPresence) {
  if (presence.message?.text) {
    return presence.message.text
  }

  if (presence.mood === "waiting") {
    return "waiting for input"
  }

  if (presence.mood === "failed") {
    return "something needs attention"
  }

  if (presence.mood === "review") {
    return "ready for review"
  }

  return idlePresence.message?.text ?? ""
}

export function WorkspaceGhostPet({
  presence = idlePresence,
}: {
  presence?: PetPresence
}) {
  const message = getPresenceMessage(presence)

  return (
    <div
      aria-label="Agent presence"
      className="pointer-events-none fixed right-4 bottom-28 z-50"
    >
      <div className="relative">
        {message ? (
          <div className="absolute bottom-full left-1/2 mb-2 max-w-56 -translate-x-1/2 rounded-full bg-background/95 px-3 py-1.5 text-center text-[11px] font-medium whitespace-nowrap text-muted-foreground backdrop-blur">
            {message}
          </div>
        ) : null}
        <div className="px-3 py-2 text-foreground">
          <div
            aria-hidden="true"
            className="grid select-none grid-cols-[repeat(8,var(--ghost-cell-width))] grid-rows-[repeat(5,var(--ghost-cell-height))] place-items-center font-mono text-[12px] leading-none"
            style={
              {
                "--ghost-cell-height": GHOST_CELL_HEIGHT,
                "--ghost-cell-width": GHOST_CELL_WIDTH,
              } as React.CSSProperties
            }
          >
            {GHOST_GLYPH_ROWS.flatMap((row, rowIndex) =>
              [...row].map((character, columnIndex) => (
                <span key={`${rowIndex}:${columnIndex}`}>{character}</span>
              ))
            )}
          </div>
        </div>
        {presence.action ? (
          <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium whitespace-nowrap text-muted-foreground backdrop-blur">
            {presence.action.label}
          </div>
        ) : null}
      </div>
    </div>
  )
}
