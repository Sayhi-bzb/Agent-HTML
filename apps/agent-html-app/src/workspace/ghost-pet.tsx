import type * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

const GHOST_GLYPH_ROWS = [
  "╭──────╮",
  "│ █  █ │",
  "│      │",
  "│╭╮╭╮╭╮│",
  "╰╯╰╯╰╯╰╯",
] as const

const GHOST_CELL_WIDTH = "0.4rem"
const GHOST_CELL_HEIGHT = "0.9rem"
const GHOST_POSITION_STORAGE_KEY = "agent-html.workspace-ghost-pet-position"
const GHOST_VIEWPORT_MARGIN = 24

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

type GhostPetPosition = {
  x: number
  y: number
}

type GhostPetDragState = {
  pointerId: number
  startClientX: number
  startClientY: number
  startPosition: GhostPetPosition
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

function getDefaultPosition(): GhostPetPosition {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 }
  }

  return {
    x: window.innerWidth - 48,
    y: window.innerHeight - 112,
  }
}

function clampPosition(position: GhostPetPosition): GhostPetPosition {
  if (typeof window === "undefined") {
    return position
  }

  return {
    x: Math.min(
      Math.max(position.x, GHOST_VIEWPORT_MARGIN),
      window.innerWidth - GHOST_VIEWPORT_MARGIN
    ),
    y: Math.min(
      Math.max(position.y, GHOST_VIEWPORT_MARGIN),
      window.innerHeight - GHOST_VIEWPORT_MARGIN
    ),
  }
}

function loadStoredPosition(): GhostPetPosition {
  if (typeof localStorage === "undefined") {
    return getDefaultPosition()
  }

  try {
    const stored = localStorage.getItem(GHOST_POSITION_STORAGE_KEY)
    if (!stored) {
      return getDefaultPosition()
    }

    const parsed: unknown = JSON.parse(stored)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "x" in parsed &&
      "y" in parsed &&
      typeof parsed.x === "number" &&
      typeof parsed.y === "number"
    ) {
      return clampPosition({ x: parsed.x, y: parsed.y })
    }
  } catch {
    return getDefaultPosition()
  }

  return getDefaultPosition()
}

function saveStoredPosition(position: GhostPetPosition) {
  if (typeof localStorage === "undefined") {
    return
  }

  localStorage.setItem(
    GHOST_POSITION_STORAGE_KEY,
    JSON.stringify(clampPosition(position))
  )
}

export function WorkspaceGhostPet({
  presence = idlePresence,
}: {
  presence?: PetPresence
}) {
  const message = getPresenceMessage(presence)
  const dragStateRef = useRef<GhostPetDragState | null>(null)
  const [position, setPosition] = useState<GhostPetPosition>(loadStoredPosition)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setPosition((currentPosition) => {
        const nextPosition = clampPosition(currentPosition)
        saveStoredPosition(nextPosition)
        return nextPosition
      })
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      dragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPosition: position,
      }
      setIsDragging(true)
    },
    [position]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      const nextPosition = clampPosition({
        x: dragState.startPosition.x + event.clientX - dragState.startClientX,
        y: dragState.startPosition.y + event.clientY - dragState.startClientY,
      })
      setPosition(nextPosition)
    },
    []
  )

  const finishDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    dragStateRef.current = null
    setIsDragging(false)
    setPosition((currentPosition) => {
      const nextPosition = clampPosition(currentPosition)
      saveStoredPosition(nextPosition)
      return nextPosition
    })
  }, [])

  return (
    <div
      aria-label="Agent presence"
      className="pointer-events-none fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="relative">
        {message ? (
          <div className="absolute bottom-full left-1/2 mb-2 max-w-56 -translate-x-1/2 rounded-full bg-background/95 px-3 py-1.5 text-center text-[11px] font-medium whitespace-nowrap text-muted-foreground backdrop-blur">
            {message}
          </div>
        ) : null}
        <div
          className={[
            "pointer-events-auto px-3 py-2 text-foreground",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          ].join(" ")}
          onPointerCancel={finishDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
        >
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
