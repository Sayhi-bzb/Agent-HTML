import type * as React from "react"

const GHOST_GLYPH_ROWS = [
  "╭──────╮",
  "│ █  █ │",
  "│      │",
  "│╭╮╭╮╭╮│",
  "╰╯╰╯╰╯╰╯",
] as const

const GHOST_CELL_WIDTH = "0.4rem"
const GHOST_CELL_HEIGHT = "0.9rem"

export function WorkspaceGhostPet() {
  return (
    <div
      aria-label="Agent presence demo"
      className="pointer-events-none fixed right-4 bottom-28 z-50 flex flex-col items-center gap-2"
    >
      <div className="rounded-full bg-background/95 px-3 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
        watching this canvas
      </div>
      <div className="px-3 py-2 text-foreground">
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
    </div>
  )
}
