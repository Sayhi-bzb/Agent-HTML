import type * as React from "react"

const GHOST_GLYPH_ROWS = [
  "╭──────╮",
  "│ █  █ │",
  "│      │",
  "│╭╮╭╮╭╮│",
  "╰╯╰╯╰╯╰╯",
] as const

const GHOST_CELL_WIDTH = "6.4px"
const GHOST_CELL_HEIGHT = "14.4px"
const GHOST_FONT_FAMILY =
  '"Cascadia Mono", "Cascadia Code", Consolas, "SFMono-Regular", Menlo, Monaco, "Liberation Mono", "Courier New", monospace'
const GHOST_FONT_SIZE = "12px"

export function AsciiGhost() {
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
      {GHOST_GLYPH_ROWS.join("\n")}
    </pre>
  )
}
