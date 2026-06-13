import {
  PatternCircles,
  PatternHexagons,
  PatternLines,
  PatternWaves,
} from "@visx/pattern"

export type ChartTextureKind = "circles" | "hexagons" | "lines" | "waves"

export type ChartTextureDensity = "dense" | "loose" | "normal"

export type ChartTextureOrientation =
  | "cross"
  | "diagonal"
  | "horizontal"
  | "vertical"

export interface ChartTextureOptions {
  density?: ChartTextureDensity
  kind?: ChartTextureKind
  opacity?: number
  orientation?: ChartTextureOrientation
}

interface ResolvedChartTextureOptions {
  density: ChartTextureDensity
  kind: ChartTextureKind
  opacity: number
  orientation: ChartTextureOrientation
}

const TEXTURE_SEQUENCE: ChartTextureKind[] = [
  "lines",
  "circles",
  "waves",
  "hexagons",
]

const densityScale: Record<ChartTextureDensity, number> = {
  dense: 0.75,
  loose: 1.35,
  normal: 1,
}

function sanitizeTextureIdPart(part: string | number) {
  return String(part)
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

export function createChartTextureId(
  ...parts: Array<string | number | null | undefined>
) {
  const id = parts
    .filter((part): part is string | number => part !== null && part !== undefined)
    .map(sanitizeTextureIdPart)
    .filter(Boolean)
    .join("-")

  return id ? `chart-texture-${id}` : "chart-texture-default"
}

export function getChartTextureFill(id: string) {
  return `url(#${id})`
}

export function resolveChartTextureOptions({
  index = 0,
  options,
}: {
  index?: number
  options?: ChartTextureOptions
}): ResolvedChartTextureOptions {
  return {
    density: options?.density ?? "normal",
    kind: options?.kind ?? TEXTURE_SEQUENCE[index % TEXTURE_SEQUENCE.length],
    opacity: options?.opacity ?? 0.35,
    orientation: options?.orientation ?? "diagonal",
  }
}

function getPatternSize({
  density,
  kind,
}: Pick<ResolvedChartTextureOptions, "density" | "kind">) {
  const scale = densityScale[density]

  if (kind === "waves") {
    return Math.max(4, Math.round(12 * scale))
  }

  if (kind === "hexagons") {
    return Math.max(6, Math.round(12 * scale))
  }

  return Math.max(4, Math.round(10 * scale))
}

function getHexagonPatternSize(density: ChartTextureDensity) {
  const scale = densityScale[density]

  return {
    height: Math.max(2, Math.round(3 * scale)),
    size: Math.max(6, Math.round(8 * scale)),
  }
}

function getLineOrientations(orientation: ChartTextureOrientation) {
  if (orientation === "cross") {
    return ["diagonal", "diagonalRightToLeft"] as const
  }

  return [orientation] as const
}

export function ChartTextureDefs({
  color,
  id,
  index,
  options,
}: {
  color: string
  id: string
  index?: number
  options?: ChartTextureOptions
}) {
  const texture = resolveChartTextureOptions({ index, options })
  const size = getPatternSize(texture)

  if (texture.kind === "circles") {
    return (
      <PatternCircles
        complement={texture.density !== "loose"}
        fill={color}
        height={size}
        id={id}
        radius={Math.max(1.5, Math.round(size / 5))}
        width={size}
      />
    )
  }

  if (texture.kind === "waves") {
    return (
      <PatternWaves
        fill="transparent"
        height={size}
        id={id}
        stroke={color}
        strokeWidth={1}
        width={size}
      />
    )
  }

  if (texture.kind === "hexagons") {
    const hexagonSize = getHexagonPatternSize(texture.density)

    return (
      <PatternHexagons
        height={hexagonSize.height}
        id={id}
        size={hexagonSize.size}
        stroke={color}
        strokeWidth={1}
      />
    )
  }

  return (
    <PatternLines
      height={size}
      id={id}
      orientation={[...getLineOrientations(texture.orientation)]}
      stroke={color}
      strokeWidth={1}
      width={size}
    />
  )
}

export function ChartTexturePath({
  d,
  id,
  opacity,
}: {
  d: string
  id: string
  opacity?: number
}) {
  return (
    <path
      aria-hidden="true"
      d={d}
      fill={getChartTextureFill(id)}
      opacity={opacity}
      pointerEvents="none"
    />
  )
}

export function ChartTextureRect({
  height,
  id,
  opacity,
  width,
  x,
  y,
}: {
  height: number
  id: string
  opacity?: number
  width: number
  x: number
  y: number
}) {
  return (
    <rect
      aria-hidden="true"
      fill={getChartTextureFill(id)}
      height={height}
      opacity={opacity}
      pointerEvents="none"
      width={width}
      x={x}
      y={y}
    />
  )
}

export function ChartTextureCircle({
  cx,
  cy,
  id,
  opacity,
  r,
}: {
  cx: number
  cy: number
  id: string
  opacity?: number
  r: number
}) {
  return (
    <circle
      aria-hidden="true"
      cx={cx}
      cy={cy}
      fill={getChartTextureFill(id)}
      opacity={opacity}
      pointerEvents="none"
      r={r}
    />
  )
}
