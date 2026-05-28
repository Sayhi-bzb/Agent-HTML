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
    <div
      aria-hidden="true"
      className="grid select-none grid-cols-[repeat(8,var(--ghost-cell-width))] grid-rows-[repeat(5,var(--ghost-cell-height))] place-items-center leading-none"
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
  )
}
