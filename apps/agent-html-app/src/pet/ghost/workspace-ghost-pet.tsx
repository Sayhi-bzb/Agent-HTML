import type * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { AsciiGhost } from "@/app/pet/ghost/ascii-ghost"
import {
  clampPosition,
  loadStoredPosition,
  saveStoredPosition,
} from "@/app/pet/ghost/position"
import { GhostRadialMenu } from "@/app/pet/ghost/radial-menu"
import type { GhostPetDragState, GhostPetPosition } from "@/app/pet/ghost/types"
import type { PetPresence } from "@/app/workspace/agent-presence"

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
  const dragStateRef = useRef<GhostPetDragState | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<GhostPetPosition>(loadStoredPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        rootRef.current?.contains(event.target)
      ) {
        return
      }

      setIsMenuOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMenuOpen])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return
      }

      event.preventDefault()
      setIsMenuOpen(false)
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

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      setIsMenuOpen((current) => !current)
    },
    []
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
      ref={rootRef}
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
          onContextMenu={handleContextMenu}
          onPointerCancel={finishDrag}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
        >
          <AsciiGhost />
        </div>
        <GhostRadialMenu isOpen={isMenuOpen} />
        {presence.action ? (
          <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium whitespace-nowrap text-muted-foreground backdrop-blur">
            {presence.action.label}
          </div>
        ) : null}
      </div>
    </div>
  )
}
