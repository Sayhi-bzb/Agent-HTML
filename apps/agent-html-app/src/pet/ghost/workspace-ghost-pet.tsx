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
  message: {
    mode: "transient",
    text: "watching this canvas",
  },
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
  isThreadPickerOpen = false,
  isTranscriptOpen = false,
  messageContent,
  onInterruptTurn,
  onMessageOpenChange,
  onRespondToApproval,
  onSettingsOpenChange,
  onThreadPickerOpenChange,
  onTranscriptOpenChange,
  presence = idlePresence,
  settingsContent,
  speechBubbles = [],
  threadPickerContent,
  transcriptContent,
}: {
  canInterruptTurn?: boolean
  approval?: CodexApprovalRequest | null
  approvalError?: string | null
  isMessageOpen?: boolean
  isInterruptingTurn?: boolean
  isSettingsOpen?: boolean
  isThreadPickerOpen?: boolean
  isTranscriptOpen?: boolean
  messageContent?: React.ReactNode
  onInterruptTurn?: () => void
  onMessageOpenChange?: (open: boolean) => void
  onRespondToApproval?: (decision: CodexApprovalDecision) => void
  onSettingsOpenChange?: (open: boolean) => void
  onThreadPickerOpenChange?: (open: boolean) => void
  onTranscriptOpenChange?: (open: boolean) => void
  presence?: PetPresence
  settingsContent?: React.ReactNode
  speechBubbles?: PetSpeechBubble[]
  threadPickerContent?: React.ReactNode
  transcriptContent?: React.ReactNode
}) {
  const message = getPresenceMessage(presence)
  const hasSpeechBubbles = speechBubbles.length > 0
  const dragStateRef = useRef<GhostPetDragState | null>(null)
  const settingsDragStateRef = useRef<PopoverDragState | null>(null)
  const threadPickerDragStateRef = useRef<PopoverDragState | null>(null)
  const transcriptDragStateRef = useRef<PopoverDragState | null>(null)
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
  const [threadPickerOffset, setThreadPickerOffset] =
    useState<GhostPetPosition>({ x: 0, y: 0 })
  const threadPickerOffsetRef =
    useRef<GhostPetPosition>(threadPickerOffset)
  const pendingThreadPickerOffsetRef =
    useRef<GhostPetPosition>(threadPickerOffset)
  const threadPickerAnimationFrameRef = useRef<number | null>(null)
  const [isThreadPickerDragging, setIsThreadPickerDragging] = useState(false)
  const [transcriptOffset, setTranscriptOffset] = useState<GhostPetPosition>({
    x: 0,
    y: 0,
  })
  const transcriptOffsetRef = useRef<GhostPetPosition>(transcriptOffset)
  const pendingTranscriptOffsetRef =
    useRef<GhostPetPosition>(transcriptOffset)
  const transcriptAnimationFrameRef = useRef<number | null>(null)
  const [isTranscriptDragging, setIsTranscriptDragging] = useState(false)

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

  const applyThreadPickerOffsetFrame = useCallback(
    (nextOffset: GhostPetPosition) => {
      pendingThreadPickerOffsetRef.current = nextOffset
      if (threadPickerAnimationFrameRef.current !== null) {
        return
      }

      threadPickerAnimationFrameRef.current = window.requestAnimationFrame(
        () => {
          threadPickerAnimationFrameRef.current = null
          const frameOffset = pendingThreadPickerOffsetRef.current
          threadPickerOffsetRef.current = frameOffset
          const element = threadPickerDragStateRef.current?.element
          if (element) {
            element.style.translate = getOffsetTranslate(frameOffset)
          }
        }
      )
    },
    []
  )

  const commitThreadPickerOffset = useCallback(
    (nextOffset: GhostPetPosition) => {
      if (threadPickerAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(threadPickerAnimationFrameRef.current)
        threadPickerAnimationFrameRef.current = null
      }

      threadPickerOffsetRef.current = nextOffset
      pendingThreadPickerOffsetRef.current = nextOffset
      setThreadPickerOffset(nextOffset)
    },
    []
  )

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

  const applyTranscriptOffsetFrame = useCallback(
    (nextOffset: GhostPetPosition) => {
      pendingTranscriptOffsetRef.current = nextOffset
      if (transcriptAnimationFrameRef.current !== null) {
        return
      }

      transcriptAnimationFrameRef.current = window.requestAnimationFrame(() => {
        transcriptAnimationFrameRef.current = null
        const frameOffset = pendingTranscriptOffsetRef.current
        transcriptOffsetRef.current = frameOffset
        const element = transcriptDragStateRef.current?.element
        if (element) {
          element.style.translate = getOffsetTranslate(frameOffset)
        }
      })
    },
    []
  )

  const commitTranscriptOffset = useCallback((nextOffset: GhostPetPosition) => {
    if (transcriptAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(transcriptAnimationFrameRef.current)
      transcriptAnimationFrameRef.current = null
    }

    transcriptOffsetRef.current = nextOffset
    pendingTranscriptOffsetRef.current = nextOffset
    setTranscriptOffset(nextOffset)
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
      if (threadPickerAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(threadPickerAnimationFrameRef.current)
      }
      if (transcriptAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(transcriptAnimationFrameRef.current)
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
      onThreadPickerOpenChange?.(false)
      onTranscriptOpenChange?.(false)
      setIsMenuOpen((current) => !current)
    },
    [
      onMessageOpenChange,
      onSettingsOpenChange,
      onThreadPickerOpenChange,
      onTranscriptOpenChange,
    ]
  )

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()
      onMessageOpenChange?.(false)
      onSettingsOpenChange?.(false)
      onThreadPickerOpenChange?.(false)
      onTranscriptOpenChange?.(false)
      setIsMenuOpen((current) => !current)
    },
    [
      onMessageOpenChange,
      onSettingsOpenChange,
      onThreadPickerOpenChange,
      onTranscriptOpenChange,
    ]
  )

  const handleMenuSelect = useCallback(
    (item: GhostMenuItem["id"]) => {
      setIsMenuOpen(false)
      if (item === "message") {
        onSettingsOpenChange?.(false)
        onThreadPickerOpenChange?.(false)
        onTranscriptOpenChange?.(false)
        onMessageOpenChange?.(true)
      }
      if (item === "threads") {
        onMessageOpenChange?.(false)
        onSettingsOpenChange?.(false)
        onTranscriptOpenChange?.(false)
        commitThreadPickerOffset({ x: 0, y: 0 })
        onThreadPickerOpenChange?.(true)
      }
      if (item === "settings") {
        onMessageOpenChange?.(false)
        onThreadPickerOpenChange?.(false)
        onTranscriptOpenChange?.(false)
        commitSettingsOffset({ x: 0, y: 0 })
        onSettingsOpenChange?.(true)
      }
      if (item === "transcript") {
        onMessageOpenChange?.(false)
        onSettingsOpenChange?.(false)
        onThreadPickerOpenChange?.(false)
        commitTranscriptOffset({ x: 0, y: 0 })
        onTranscriptOpenChange?.(true)
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
      onTranscriptOpenChange,
      commitSettingsOffset,
      commitThreadPickerOffset,
      commitTranscriptOffset,
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

  const handleTranscriptOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        transcriptDragStateRef.current = null
        setIsTranscriptDragging(false)
      }
      onTranscriptOpenChange?.(open)
    },
    [onTranscriptOpenChange]
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

  const handleThreadPickerPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !isPopoverDragTarget(event.target)) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const startOffset = threadPickerOffsetRef.current
      pendingThreadPickerOffsetRef.current = startOffset
      threadPickerDragStateRef.current = {
        element: event.currentTarget,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startOffset,
      }
      setIsThreadPickerDragging(true)
    },
    []
  )

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

  const handleTranscriptPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !isPopoverDragTarget(event.target)) {
        return
      }

      event.preventDefault()
      event.currentTarget.setPointerCapture(event.pointerId)
      const startOffset = transcriptOffsetRef.current
      pendingTranscriptOffsetRef.current = startOffset
      transcriptDragStateRef.current = {
        element: event.currentTarget,
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startOffset,
      }
      setIsTranscriptDragging(true)
    },
    []
  )

  const handleThreadPickerPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = threadPickerDragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      applyThreadPickerOffsetFrame({
        x: dragState.startOffset.x + event.clientX - dragState.startClientX,
        y: dragState.startOffset.y + event.clientY - dragState.startClientY,
      })
    },
    [applyThreadPickerOffsetFrame]
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

  const handleTranscriptPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = transcriptDragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      applyTranscriptOffsetFrame({
        x: dragState.startOffset.x + event.clientX - dragState.startClientX,
        y: dragState.startOffset.y + event.clientY - dragState.startClientY,
      })
    },
    [applyTranscriptOffsetFrame]
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

      commitThreadPickerOffset(pendingThreadPickerOffsetRef.current)
      setIsThreadPickerDragging(false)
      threadPickerDragStateRef.current = null
    },
    [commitThreadPickerOffset]
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

  const finishTranscriptDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = transcriptDragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      commitTranscriptOffset(pendingTranscriptOffsetRef.current)
      setIsTranscriptDragging(false)
      transcriptDragStateRef.current = null
    },
    [commitTranscriptOffset]
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
              ) : hasSpeechBubbles
                ? speechBubbles.map((bubble, index) => (
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
                : message
                  ? (
                      <div className="max-w-full rounded-2xl bg-background/95 px-3 py-1.5 text-left text-[11px] font-medium whitespace-pre-wrap text-muted-foreground backdrop-blur break-words">
                        <PetMarkdownText text={message} />
                      </div>
                    )
                  : null}
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
              translate: getOffsetTranslate(threadPickerOffset),
              willChange: isThreadPickerDragging ? "translate" : undefined,
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
              translate: getOffsetTranslate(settingsOffset),
              willChange: isSettingsDragging ? "translate" : undefined,
            }}
          >
            {settingsContent}
          </PopoverContent>
        ) : null}
      </Popover>
      <Popover open={isTranscriptOpen} onOpenChange={handleTranscriptOpenChange}>
        <PopoverAnchor asChild>
          <div className="relative size-0" />
        </PopoverAnchor>
        {transcriptContent ? (
          <PopoverContent
            align="end"
            className={[
              "pointer-events-auto w-auto p-0 select-none",
              isTranscriptDragging ? "cursor-grabbing" : "cursor-grab",
            ].join(" ")}
            onPointerCancel={finishTranscriptDrag}
            onPointerDown={handleTranscriptPointerDown}
            onPointerMove={handleTranscriptPointerMove}
            onPointerUp={finishTranscriptDrag}
            side="left"
            sideOffset={12}
            style={{
              translate: getOffsetTranslate(transcriptOffset),
              willChange: isTranscriptDragging ? "translate" : undefined,
            }}
          >
            {transcriptContent}
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  )
}
