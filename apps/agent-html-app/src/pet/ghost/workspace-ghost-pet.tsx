import type * as React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

import type {
  CodexApprovalDecision,
  CodexApprovalRequest,
} from "@/app/codex/connection/types"
import { PetApprovalCard } from "@/app/pet/ghost/pet-approval-card"
import { AsciiGhost } from "@/app/pet/ghost/ascii-ghost"
import { PetMarkdownText } from "@/app/pet/ghost/pet-markdown-text"
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
import type {
  PetPresence,
  PetSpeechBubble,
} from "@/app/workspace/agent-presence"

const idlePresence: PetPresence = {
  mood: "idle",
}

const POPOVER_NO_DRAG_SELECTOR =
  'button,input,textarea,select,a,[role="menu"],[role="menuitem"],[data-popover-no-drag],[data-pet-settings-no-drag],[data-thread-picker-no-drag]'

type PopoverDragState = {
  element: HTMLElement
  pointerId: number
  startClientX: number
  startClientY: number
  startOffset: GhostPetPosition
}

function isPopoverDragTarget(target: EventTarget | null) {
  return target instanceof Element && !target.closest(POPOVER_NO_DRAG_SELECTOR)
}

function getGhostTransform(position: GhostPetPosition) {
  return `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`
}

function getOffsetTranslate(offset: GhostPetPosition) {
  return `${offset.x}px ${offset.y}px`
}

function getSpeechBubbleStyle(index: number, total: number) {
  const distanceFromLatest = total - index - 1
  return {
    opacity: distanceFromLatest === 0 ? 1 : 0.55,
    transform:
      distanceFromLatest === 0
        ? "translateY(0) scale(1)"
        : "translateY(-12px) scale(0.96)",
  }
}

export function WorkspaceGhostPet({
  canInterruptTurn = false,
  approval,
  approvalError,
  isMessageOpen = false,
  isInterruptingTurn = false,
  isSettingsOpen = false,
  messageContent,
  onInterruptTurn,
  onMessageOpenChange,
  onRespondToApproval,
  onSettingsOpenChange,
  onThreadPanelOpenChange,
  presence = idlePresence,
  settingsContent,
  speechBubbles = [],
}: {
  canInterruptTurn?: boolean
  approval?: CodexApprovalRequest | null
  approvalError?: string | null
  isMessageOpen?: boolean
  isInterruptingTurn?: boolean
  isSettingsOpen?: boolean
  messageContent?: React.ReactNode
  onInterruptTurn?: () => void
  onMessageOpenChange?: (open: boolean) => void
  onRespondToApproval?: (decision: CodexApprovalDecision) => void
  onSettingsOpenChange?: (open: boolean) => void
  onThreadPanelOpenChange?: (open: boolean) => void
  presence?: PetPresence
  settingsContent?: React.ReactNode
  speechBubbles?: PetSpeechBubble[]
}) {
  const statusMessage = presence.message?.text
  const hasSpeechBubbles = speechBubbles.length > 0
  const dragStateRef = useRef<GhostPetDragState | null>(null)
  const settingsDragStateRef = useRef<PopoverDragState | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState<GhostPetPosition>(loadStoredPosition)
  const positionRef = useRef<GhostPetPosition>(position)
  const pendingPositionRef = useRef<GhostPetPosition>(position)
  const positionAnimationFrameRef = useRef<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [settingsOffset, setSettingsOffset] = useState<GhostPetPosition>({
    x: 0,
    y: 0,
  })
  const settingsOffsetRef = useRef<GhostPetPosition>(settingsOffset)
  const pendingSettingsOffsetRef = useRef<GhostPetPosition>(settingsOffset)
  const settingsAnimationFrameRef = useRef<number | null>(null)
  const [isSettingsDragging, setIsSettingsDragging] = useState(false)

  const applyPositionFrame = useCallback((nextPosition: GhostPetPosition) => {
    pendingPositionRef.current = nextPosition
    if (positionAnimationFrameRef.current !== null) {
      return
    }

    positionAnimationFrameRef.current = window.requestAnimationFrame(() => {
      positionAnimationFrameRef.current = null
      const framePosition = pendingPositionRef.current
      positionRef.current = framePosition
      if (rootRef.current) {
        rootRef.current.style.transform = getGhostTransform(framePosition)
      }
    })
  }, [])

  const commitPosition = useCallback((nextPosition: GhostPetPosition) => {
    if (positionAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(positionAnimationFrameRef.current)
      positionAnimationFrameRef.current = null
    }

    positionRef.current = nextPosition
    pendingPositionRef.current = nextPosition
    if (rootRef.current) {
      rootRef.current.style.transform = getGhostTransform(nextPosition)
    }
    setPosition(nextPosition)
  }, [])

  const applySettingsOffsetFrame = useCallback(
    (nextOffset: GhostPetPosition) => {
      pendingSettingsOffsetRef.current = nextOffset
      if (settingsAnimationFrameRef.current !== null) {
        return
      }

      settingsAnimationFrameRef.current = window.requestAnimationFrame(() => {
        settingsAnimationFrameRef.current = null
        const frameOffset = pendingSettingsOffsetRef.current
        settingsOffsetRef.current = frameOffset
        const element = settingsDragStateRef.current?.element
        if (element) {
          element.style.translate = getOffsetTranslate(frameOffset)
        }
      })
    },
    []
  )

  const commitSettingsOffset = useCallback((nextOffset: GhostPetPosition) => {
    if (settingsAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(settingsAnimationFrameRef.current)
      settingsAnimationFrameRef.current = null
    }

    settingsOffsetRef.current = nextOffset
    pendingSettingsOffsetRef.current = nextOffset
    setSettingsOffset(nextOffset)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      const nextPosition = clampPosition(positionRef.current)
      commitPosition(nextPosition)
      saveStoredPosition(nextPosition)
    }

    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [commitPosition])

  useEffect(
    () => () => {
      if (positionAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(positionAnimationFrameRef.current)
      }
      if (settingsAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(settingsAnimationFrameRef.current)
      }
    },
    []
  )

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
      const startPosition = positionRef.current
      pendingPositionRef.current = startPosition
      dragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPosition,
      }
      setIsDragging(true)
    },
    []
  )

  const handleContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      onMessageOpenChange?.(false)
      onSettingsOpenChange?.(false)
      setIsMenuOpen((current) => !current)
    },
    [
      onMessageOpenChange,
      onSettingsOpenChange,
    ]
  )

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      onSettingsOpenChange?.(false)
      setIsMenuOpen(false)
      onMessageOpenChange?.(true)
    },
    [
      onMessageOpenChange,
      onSettingsOpenChange,
    ]
  )

  const handleMenuSelect = useCallback(
    (item: GhostMenuItem["id"]) => {
      setIsMenuOpen(false)
      if (item === "message") {
        onSettingsOpenChange?.(false)
        onMessageOpenChange?.(true)
      }
      if (item === "threads") {
        onMessageOpenChange?.(false)
        onSettingsOpenChange?.(false)
        onThreadPanelOpenChange?.(true)
      }
      if (item === "settings") {
        onMessageOpenChange?.(false)
        commitSettingsOffset({ x: 0, y: 0 })
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
      onThreadPanelOpenChange,
      commitSettingsOffset,
    ]
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
      applyPositionFrame(nextPosition)
    },
    [applyPositionFrame]
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
    const nextPosition = clampPosition(pendingPositionRef.current)
    commitPosition(nextPosition)
    saveStoredPosition(nextPosition)
    setIsDragging(false)
  }, [commitPosition])

  const handleSettingsPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !isPopoverDragTarget(event.target)) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const startOffset = settingsOffsetRef.current
      pendingSettingsOffsetRef.current = startOffset
      settingsDragStateRef.current = {
        element: event.currentTarget,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startOffset,
      }
      setIsSettingsDragging(true)
    },
    []
  )

  const handleSettingsPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = settingsDragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      applySettingsOffsetFrame({
        x: dragState.startOffset.x + event.clientX - dragState.startClientX,
        y: dragState.startOffset.y + event.clientY - dragState.startClientY,
      })
    },
    [applySettingsOffsetFrame]
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

      commitSettingsOffset(pendingSettingsOffsetRef.current)
      setIsSettingsDragging(false)
      settingsDragStateRef.current = null
    },
    [commitSettingsOffset]
  )

  return (
    <div
      aria-label="Agent presence"
      className="pointer-events-none fixed z-50"
      ref={rootRef}
      style={{
        left: 0,
        top: 0,
        transform: getGhostTransform(position),
        willChange: isDragging ? "transform" : undefined,
      }}
    >
      <Popover open={isMessageOpen} onOpenChange={onMessageOpenChange}>
        <PopoverAnchor asChild>
          <div className="relative">
            <div className="absolute bottom-full left-1/2 mb-2 flex w-max max-w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 flex-col items-center gap-0">
              {approval ? (
                <PetApprovalCard
                  approval={approval}
                  error={approvalError}
                  onRespond={onRespondToApproval}
                />
              ) : hasSpeechBubbles ? (
                speechBubbles.map((bubble, index) => (
                    <div
                      className={[
                        "max-w-full rounded-2xl bg-background/95 px-3 py-1.5 text-left text-[11px] font-medium whitespace-pre-wrap text-muted-foreground shadow-sm backdrop-blur break-words transition-[opacity,transform] duration-300 ease-out will-change-transform",
                      ].join(" ")}
                      key={bubble.id}
                      style={
                        bubble.mode === "exiting"
                          ? {
                              opacity: 0,
                              transform: "translateY(-24px) scale(0.92)",
                            }
                          : getSpeechBubbleStyle(index, speechBubbles.length)
                      }
                    >
                      <PetMarkdownText text={bubble.text} />
                    </div>
                  ))
              ) : null}
            </div>
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
            {statusMessage || presence.action ? (
              <div className="absolute top-full left-1/2 mt-2 flex max-w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 flex-col items-center gap-1">
                {statusMessage ? (
                  <div className="max-w-full rounded-full bg-background/80 px-2.5 py-1 text-center text-[10px] font-medium whitespace-normal text-muted-foreground backdrop-blur break-words">
                    {statusMessage}
                  </div>
                ) : null}
                {presence.action ? (
                  <div className="max-w-full rounded-full bg-background/80 px-2.5 py-1 text-center text-[10px] font-medium whitespace-nowrap text-muted-foreground backdrop-blur">
                    {presence.action.label}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </PopoverAnchor>
        {messageContent ? (
          <PopoverContent
            align="end"
            className="pointer-events-auto w-90 border-0 bg-transparent p-0 shadow-none"
            side="left"
            sideOffset={12}
          >
            {messageContent}
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
              "pointer-events-auto w-auto p-0 select-none",
              isSettingsDragging ? "cursor-grabbing" : "cursor-grab",
            ].join(" ")}
            onPointerCancel={finishSettingsDrag}
            onPointerDown={handleSettingsPointerDown}
            onPointerMove={handleSettingsPointerMove}
            onPointerUp={finishSettingsDrag}
            side="left"
            sideOffset={12}
            style={{
              translate: getOffsetTranslate(settingsOffset),
              willChange: isSettingsDragging ? "translate" : undefined,
            }}
          >
            {settingsContent}
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  )
}
