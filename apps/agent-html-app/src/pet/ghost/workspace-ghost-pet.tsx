import type * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import { AsciiGhost } from "@/app/pet/ghost/ascii-ghost"
import {
  clampPosition,
  loadStoredPosition,
  saveStoredPosition,
} from "@/app/pet/ghost/position"
import { GhostRadialMenu } from "@/app/pet/ghost/radial-menu"
import type {
  GhostMenuItem,
  GhostPetDragState,
  GhostPetPosition,
} from "@/app/pet/ghost/types"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/app/shared/ui/popover"
import type { PetPresence } from "@/app/workspace/agent-presence"

const idlePresence: PetPresence = {
  message: {
    mode: "transient",
    text: "watching this canvas",
  },
  mood: "idle",
}

const THREAD_PICKER_NO_DRAG_SELECTOR =
  'button,input,textarea,select,a,[role="menu"],[role="menuitem"],[data-thread-picker-no-drag]'

type ThreadPickerDragState = {
  pointerId: number
  startClientX: number
  startClientY: number
  startOffset: GhostPetPosition
}

function isThreadPickerDragTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    !target.closest(THREAD_PICKER_NO_DRAG_SELECTOR)
  )
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
  isMessageOpen = false,
  isThreadPickerOpen = false,
  messageContent,
  onMessageOpenChange,
  onThreadPickerOpenChange,
  presence = idlePresence,
  threadPickerContent,
}: {
  isMessageOpen?: boolean
  isThreadPickerOpen?: boolean
  messageContent?: React.ReactNode
  onMessageOpenChange?: (open: boolean) => void
  onThreadPickerOpenChange?: (open: boolean) => void
  presence?: PetPresence
  threadPickerContent?: React.ReactNode
}) {
  const message = getPresenceMessage(presence)
  const dragStateRef = useRef<GhostPetDragState | null>(null)
  const threadPickerDragStateRef = useRef<ThreadPickerDragState | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<GhostPetPosition>(loadStoredPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [threadPickerOffset, setThreadPickerOffset] =
    useState<GhostPetPosition>({ x: 0, y: 0 })
  const [isThreadPickerDragging, setIsThreadPickerDragging] = useState(false)

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

  useEffect(() => {
    if (isThreadPickerOpen) {
      setThreadPickerOffset({ x: 0, y: 0 })
      return
    }

    threadPickerDragStateRef.current = null
    setIsThreadPickerDragging(false)
  }, [isThreadPickerOpen])

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
      onMessageOpenChange?.(false)
      onThreadPickerOpenChange?.(false)
      setIsMenuOpen((current) => !current)
    },
    [onMessageOpenChange, onThreadPickerOpenChange]
  )

  const handleMenuSelect = useCallback(
    (item: GhostMenuItem["id"]) => {
      setIsMenuOpen(false)
      if (item === "message") {
        onThreadPickerOpenChange?.(false)
        onMessageOpenChange?.(true)
      }
      if (item === "threads") {
        onMessageOpenChange?.(false)
        onThreadPickerOpenChange?.(true)
      }
    },
    [onMessageOpenChange, onThreadPickerOpenChange]
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

  const handleThreadPickerPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !isThreadPickerDragTarget(event.target)) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      threadPickerDragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startOffset: threadPickerOffset,
      }
      setIsThreadPickerDragging(true)
    },
    [threadPickerOffset]
  )

  const handleThreadPickerPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = threadPickerDragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      setThreadPickerOffset({
        x: dragState.startOffset.x + event.clientX - dragState.startClientX,
        y: dragState.startOffset.y + event.clientY - dragState.startClientY,
      })
    },
    []
  )

  const finishThreadPickerDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = threadPickerDragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      threadPickerDragStateRef.current = null
      setIsThreadPickerDragging(false)
    },
    []
  )

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
      <Popover open={isMessageOpen} onOpenChange={onMessageOpenChange}>
        <PopoverAnchor asChild>
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
            <GhostRadialMenu isOpen={isMenuOpen} onSelect={handleMenuSelect} />
            {presence.action ? (
              <div className="absolute top-full left-1/2 mt-2 -translate-x-1/2 rounded-full bg-background/80 px-2.5 py-1 text-[10px] font-medium whitespace-nowrap text-muted-foreground backdrop-blur">
                {presence.action.label}
              </div>
            ) : null}
          </div>
        </PopoverAnchor>
        {messageContent ? (
          <PopoverContent
            align="end"
            className="pointer-events-auto w-90 p-0"
            side="left"
            sideOffset={12}
          >
            {messageContent}
          </PopoverContent>
        ) : null}
      </Popover>
      <Popover
        open={isThreadPickerOpen}
        onOpenChange={onThreadPickerOpenChange}
      >
        <PopoverAnchor asChild>
          <div className="relative size-0" />
        </PopoverAnchor>
        {threadPickerContent ? (
          <PopoverContent
            align="end"
            className={[
              "pointer-events-auto w-80 p-3 select-none",
              isThreadPickerDragging ? "cursor-grabbing" : "cursor-grab",
            ].join(" ")}
            onPointerCancel={finishThreadPickerDrag}
            onPointerDown={handleThreadPickerPointerDown}
            onPointerMove={handleThreadPickerPointerMove}
            onPointerUp={finishThreadPickerDrag}
            side="left"
            sideOffset={12}
            style={{
              translate: `${threadPickerOffset.x}px ${threadPickerOffset.y}px`,
            }}
          >
            {threadPickerContent}
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  )
}
