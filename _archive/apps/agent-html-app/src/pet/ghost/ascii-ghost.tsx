import type * as React from "react"
import { useEffect, useRef } from "react"

const GHOST_GLYPH_ROWS = [
  "╭──────╮",
  "│      │",
  "│╭╮╭╮╭╮│",
  "╰╯╰╯╰╯╰╯",
] as const

const GHOST_EYE_FRAMES = ["█", "▇", "▅", "▂", "▁", "▁", "▃", "▆", "█"] as const
const GHOST_CELL_WIDTH = "6.4px"
const GHOST_CELL_HEIGHT = "14.4px"
const GHOST_FONT_FAMILY =
  '"Cascadia Mono", "Cascadia Code", Consolas, "SFMono-Regular", Menlo, Monaco, "Liberation Mono", "Courier New", monospace'
const GHOST_FONT_SIZE = "12px"
const GHOST_BLINK_FPS = 30
const GHOST_BLINK_FRAME_MS = 1000 / GHOST_BLINK_FPS
const GHOST_BLINK_IDLE_MIN_MS = 2000
const GHOST_BLINK_IDLE_MAX_MS = 5000
const GHOST_GAZE_HOLD_MIN_MS = 2400
const GHOST_GAZE_HOLD_MAX_MS = 3200
const GHOST_GAZE_MOVE_MS = 100
const GHOST_GAZE_IDLE_MIN_MS = 6000
const GHOST_GAZE_IDLE_MAX_MS = 12000
const GHOST_GAZE_CENTER_WEIGHT = 0.45
const GHOST_GAZE_LEFT_WEIGHT_END = 0.725

type GhostEyeGlyph = (typeof GHOST_EYE_FRAMES)[number]
type GhostGaze = "center" | "left" | "right"
type GhostEyeState = {
  gaze: GhostGaze
  glyph: GhostEyeGlyph
}
type GhostEyeRefs = {
  gapRef: React.RefObject<HTMLSpanElement | null>
  leftEyeRef: React.RefObject<HTMLSpanElement | null>
  prefixRef: React.RefObject<HTMLSpanElement | null>
  rightEyeRef: React.RefObject<HTMLSpanElement | null>
  suffixRef: React.RefObject<HTMLSpanElement | null>
}

const GHOST_GAZE_LAYOUTS: Record<
  GhostGaze,
  { gap: string; prefix: string; suffix: string }
> = {
  center: { gap: "  ", prefix: " ", suffix: " " },
  left: { gap: "  ", prefix: "", suffix: "  " },
  right: { gap: "  ", prefix: "  ", suffix: "" },
}

function getNextBlinkDelay() {
  return (
    GHOST_BLINK_IDLE_MIN_MS +
    Math.random() * (GHOST_BLINK_IDLE_MAX_MS - GHOST_BLINK_IDLE_MIN_MS)
  )
}

function getNextGazeDelay() {
  return (
    GHOST_GAZE_IDLE_MIN_MS +
    Math.random() * (GHOST_GAZE_IDLE_MAX_MS - GHOST_GAZE_IDLE_MIN_MS)
  )
}

function getNextGazeHold() {
  return (
    GHOST_GAZE_HOLD_MIN_MS +
    Math.random() * (GHOST_GAZE_HOLD_MAX_MS - GHOST_GAZE_HOLD_MIN_MS)
  )
}

function chooseGaze() {
  const roll = Math.random()

  if (roll < GHOST_GAZE_CENTER_WEIGHT) return "center"
  if (roll < GHOST_GAZE_LEFT_WEIGHT_END) return "left"

  return "right"
}

function applyEyeState(refs: GhostEyeRefs, state: GhostEyeState) {
  const layout = GHOST_GAZE_LAYOUTS[state.gaze]

  if (refs.prefixRef.current) refs.prefixRef.current.textContent = layout.prefix
  if (refs.leftEyeRef.current) refs.leftEyeRef.current.textContent = state.glyph
  if (refs.gapRef.current) refs.gapRef.current.textContent = layout.gap
  if (refs.rightEyeRef.current) refs.rightEyeRef.current.textContent = state.glyph
  if (refs.suffixRef.current) refs.suffixRef.current.textContent = layout.suffix
}

function useAsciiGhostEyeTracks() {
  const gapRef = useRef<HTMLSpanElement | null>(null)
  const leftEyeRef = useRef<HTMLSpanElement | null>(null)
  const prefixRef = useRef<HTMLSpanElement | null>(null)
  const rightEyeRef = useRef<HTMLSpanElement | null>(null)
  const suffixRef = useRef<HTMLSpanElement | null>(null)
  const eyeStateRef = useRef<GhostEyeState>({ gaze: "center", glyph: "█" })

  useEffect(() => {
    const refs = {
      gapRef,
      leftEyeRef,
      prefixRef,
      rightEyeRef,
      suffixRef,
    }
    const timeoutIds = new Set<number>()

    const setTrackedTimeout = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(() => {
        timeoutIds.delete(timeoutId)
        callback()
      }, delay)
      timeoutIds.add(timeoutId)
      return timeoutId
    }

    const scheduleBlink = () => {
      setTrackedTimeout(runBlink, getNextBlinkDelay())
    }
    const scheduleGaze = () => {
      setTrackedTimeout(runGaze, getNextGazeDelay())
    }
    const updateEyeState = (nextState: Partial<GhostEyeState>) => {
      eyeStateRef.current = { ...eyeStateRef.current, ...nextState }
      applyEyeState(refs, eyeStateRef.current)
    }
    const runBlink = () => {
      let frameIndex = 0

      const advanceFrame = () => {
        updateEyeState({ glyph: GHOST_EYE_FRAMES[frameIndex] })
        frameIndex += 1

        if (frameIndex < GHOST_EYE_FRAMES.length) {
          setTrackedTimeout(advanceFrame, GHOST_BLINK_FRAME_MS)
          return
        }

        scheduleBlink()
      }

      advanceFrame()
    }
    const runGaze = () => {
      const gaze = chooseGaze()
      const holdMs = getNextGazeHold()

      if (gaze === "center") {
        updateEyeState({ gaze })
        setTrackedTimeout(scheduleGaze, holdMs)
        return
      }

      updateEyeState({ gaze })
      setTrackedTimeout(() => {
        updateEyeState({ gaze: "center" })
        setTrackedTimeout(scheduleGaze, GHOST_GAZE_MOVE_MS)
      }, holdMs + GHOST_GAZE_MOVE_MS)
    }

    applyEyeState(refs, eyeStateRef.current)
    scheduleBlink()
    scheduleGaze()

    return () => {
      for (const timeoutId of timeoutIds) {
        window.clearTimeout(timeoutId)
      }
      timeoutIds.clear()
    }
  }, [])

  return { gapRef, leftEyeRef, prefixRef, rightEyeRef, suffixRef }
}

export function AsciiGhost() {
  const { gapRef, leftEyeRef, prefixRef, rightEyeRef, suffixRef } =
    useAsciiGhostEyeTracks()

  return (
    <pre
      aria-hidden="true"
      className="m-0 select-none leading-[var(--ghost-row-height)] whitespace-pre text-center"
      lang="en"
      style={
        {
          fontFamily: GHOST_FONT_FAMILY,
          fontFeatureSettings: '"liga" 0, "calt" 0',
          fontKerning: "none",
          fontSize: GHOST_FONT_SIZE,
          fontSynthesis: "none",
          fontWeight: 700,
          fontVariantLigatures: "none",
          letterSpacing: "0",
          "--ghost-row-height": GHOST_CELL_HEIGHT,
          width: `calc(${GHOST_CELL_WIDTH} * 8)`,
        } as React.CSSProperties
      }
    >
      {GHOST_GLYPH_ROWS[0]}
      {"\n"}
      {"│"}
      <span ref={prefixRef}> </span>
      <span ref={leftEyeRef}>█</span>
      <span ref={gapRef}>{"  "}</span>
      <span ref={rightEyeRef}>█</span>
      <span ref={suffixRef}> </span>
      {"│"}
      {"\n"}
      {GHOST_GLYPH_ROWS.slice(1).join("\n")}
    </pre>
  )
}
