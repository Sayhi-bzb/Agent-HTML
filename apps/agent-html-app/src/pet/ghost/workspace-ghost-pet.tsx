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

const POPOVER_NO_DRAG_SELECTOR =
  'button,input,textarea,select,a,[role="menu"],[role="menuitem"],[data-popover-no-drag],[data-pet-settings-no-drag],[data-thread-picker-no-drag]'

type PopoverDragState = {
  pointerId: number
  startClientX: number
  startClientY: number
  startOffset: GhostPetPosition
}

function isPopoverDragTarget(target: EventTarget | null) {
  return target instanceof Element && !target.closest(POPOVER_NO_DRAG_SELECTOR)
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
  canInterruptTurn = false,
  isMessageOpen = false,
  isInterruptingTurn = false,
  isSettingsOpen = false,
  isThreadPickerOpen = false,
  messageContent,
  onInterruptTurn,
  onMessageOpenChange,
  onSettingsOpenChange,
  onThreadPickerOpenChange,
  presence = idlePresence,
  settingsContent,
  threadPickerContent,
}: {
  canInterruptTurn?: boolean
  isMessageOpen?: boolean
  isInterruptingTurn?: boolean
  isSettingsOpen?: boolean
  isThreadPickerOpen?: boolean
  messageContent?: React.ReactNode
  onInterruptTurn?: () => void
  onMessageOpenChange?: (open: boolean) => void
  onSettingsOpenChange?: (open: boolean) => void
  onThreadPickerOpenChange?: (open: boolean) => void
  presence?: PetPresence
  settingsContent?: React.ReactNode
  threadPickerContent?: React.ReactNode
}) {
  const message = getPresenceMessage(presence)
  const dragStateRef = useRef<GhostPetDragState | null>(null)
  const settingsDragStateRef = useRef<PopoverDragState | null>(null)
  const threadPickerDragStateRef = useRef<PopoverDragState | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<GhostPetPosition>(loadStoredPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [settingsOffset, setSettingsOffset] = useState<GhostPetPosition>({
    x: 0,
    y: 0,
  })
  const [isSettingsDragging, setIsSettingsDragging] = useState(false)
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
      onSettingsOpenChange?.(false)
      onThreadPickerOpenChange?.(false)
      setIsMenuOpen((current) => !current)
    },
    [onMessageOpenChange, onSettingsOpenChange, onThreadPickerOpenChange]
  )

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      onMessageOpenChange?.(false)
      onSettingsOpenChange?.(false)
      onThreadPickerOpenChange?.(false)
      setIsMenuOpen((current) => !current)
    },
    [onMessageOpenChange, onSettingsOpenChange, onThreadPickerOpenChange]
  )

  const handleMenuSelect = useCallback(
    (item: GhostMenuItem["id"]) => {
      setIsMenuOpen(false)
      if (item === "message") {
        onSettingsOpenChange?.(false)
        onThreadPickerOpenChange?.(false)
        onMessageOpenChange?.(true)
      }
      if (item === "threads") {
        onMessageOpenChange?.(false)
        onSettingsOpenChange?.(false)
        setThreadPickerOffset({ x: 0, y: 0 })
        onThreadPickerOpenChange?.(true)
      }
      if (item === "settings") {
        onMessageOpenChange?.(false)
        onThreadPickerOpenChange?.(false)
        setSettingsOffset({ x: 0, y: 0 })
        onSettingsOpenChange?.(true)
      }
      if (item === "interrupt") {
        onInterruptTurn?.()
      }
    },
    [
      onInterruptTurn,
      onMessageOpenChange,
      onSettingsOpenChange,
      onThreadPickerOpenChange,
    ]
  )

  const handleThreadPickerOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        threadPickerDragStateRef.current = null
        setIsThreadPickerDragging(false)
      }
      onThreadPickerOpenChange?.(open)
    },
    [onThreadPickerOpenChange]
  )

  const handleSettingsOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        settingsDragStateRef.current = null
        setIsSettingsDragging(false)
      }
      onSettingsOpenChange?.(open)
    },
    [onSettingsOpenChange]
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
      if (event.button !== 0 || !isPopoverDragTarget(event.target)) {
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

  const handleSettingsPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !isPopoverDragTarget(event.target)) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      settingsDragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startOffset: settingsOffset,
      }
      setIsSettingsDragging(true)
    },
    [settingsOffset]
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

  const handleSettingsPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = settingsDragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      setSettingsOffset({
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

  const finishSettingsDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = settingsDragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      settingsDragStateRef.current = null
      setIsSettingsDragging(false)
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
              onDoubleClick={handleDoubleClick}
              onPointerCancel={finishDrag}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={finishDrag}
            >
              <AsciiGhost />
            </div>
            <GhostRadialMenu
              canInterrupt={canInterruptTurn}
              isInterrupting={isInterruptingTurn}
              isOpen={isMenuOpen}
              onSelect={handleMenuSelect}
            />
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
        onOpenChange={handleThreadPickerOpenChange}
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
      <Popover open={isSettingsOpen} onOpenChange={handleSettingsOpenChange}>
        <PopoverAnchor asChild>
          <div className="relative size-0" />
        </PopoverAnchor>
        {settingsContent ? (
          <PopoverContent
            align="end"
            className={[
              "pointer-events-auto w-[30rem] p-3 select-none",
              isSettingsDragging ? "cursor-grabbing" : "cursor-grab",
            ].join(" ")}
            onPointerCancel={finishSettingsDrag}
            onPointerDown={handleSettingsPointerDown}
            onPointerMove={handleSettingsPointerMove}
            onPointerUp={finishSettingsDrag}
            side="left"
            sideOffset={12}
            style={{
              translate: `${settingsOffset.x}px ${settingsOffset.y}px`,
            }}
          >
            {settingsContent}
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  )
}
