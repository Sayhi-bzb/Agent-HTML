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

function getNextBlinkDelay() {
  return (
    GHOST_BLINK_IDLE_MIN_MS +
    Math.random() * (GHOST_BLINK_IDLE_MAX_MS - GHOST_BLINK_IDLE_MIN_MS)
  )
}

function useAsciiGhostEyes() {
  const leftEyeRef = useRef<HTMLSpanElement | null>(null)
  const rightEyeRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    let timeoutId: number | undefined

    const setEyes = (eye: string) => {
      if (leftEyeRef.current) leftEyeRef.current.textContent = eye
      if (rightEyeRef.current) rightEyeRef.current.textContent = eye
    }

    const scheduleBlink = () => {
      timeoutId = window.setTimeout(runBlink, getNextBlinkDelay())
    }

    const runBlink = () => {
      let frameIndex = 0

      const advanceFrame = () => {
        setEyes(GHOST_EYE_FRAMES[frameIndex])
        frameIndex += 1

        if (frameIndex < GHOST_EYE_FRAMES.length) {
          timeoutId = window.setTimeout(advanceFrame, GHOST_BLINK_FRAME_MS)
          return
        }

        scheduleBlink()
      }

      advanceFrame()
    }

    scheduleBlink()

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [])

  return { leftEyeRef, rightEyeRef }
}

export function AsciiGhost() {
  const { leftEyeRef, rightEyeRef } = useAsciiGhostEyes()

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
      {"│ "}
      <span ref={leftEyeRef}>█</span>
      {"  "}
      <span ref={rightEyeRef}>█</span>
      {" │"}
      {"\n"}
      {GHOST_GLYPH_ROWS.slice(1).join("\n")}
    </pre>
  )
}
