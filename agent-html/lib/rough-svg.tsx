import { useRef } from "react"
import rough from "roughjs"
import type { Options as RoughOptions } from "roughjs/bin/core"
import type { RoughSVG } from "roughjs/bin/svg"

import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"

export type RoughSvgDraw = (roughSvg: RoughSVG, group: SVGGElement) => void

export const defaultRoughSvgOptions: RoughOptions = {
  bowing: 0.8,
  fillStyle: "hachure",
  roughness: 1.3,
}

function normalizeRoughOptions(options?: RoughOptions): RoughOptions {
  return { ...defaultRoughSvgOptions, ...options }
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`
  }

  return `{${Object.entries(value)
    .filter(([, entry]) => typeof entry !== "function")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
    .join(",")}}`
}

function createRoughSeed(key: string) {
  let hash = 2166136261

  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0) || 1
}

function prepareRoughOptions(options: RoughOptions | undefined, key: string) {
  const normalizedOptions = normalizeRoughOptions(options)
  const stableOptionsKey = stableStringify(normalizedOptions)
  const seed = normalizedOptions.seed ?? createRoughSeed(`${key}|${stableOptionsKey}`)

  return {
    key: `${key}|${stableOptionsKey}|${seed}`,
    options: {
      ...normalizedOptions,
      seed,
    },
  }
}

export function RoughSvgLayer({ draw }: { draw: RoughSvgDraw }) {
  const groupRef = useRef<SVGGElement>(null)

  useIsomorphicLayoutEffect(() => {
    const group = groupRef.current
    const svg = group?.ownerSVGElement

    if (!(group && svg)) {
      return
    }

    group.replaceChildren()
    draw(rough.svg(svg), group)

    return () => {
      group.replaceChildren()
    }
  }, [draw])

  return <g ref={groupRef} />
}

function useRoughElement(
  draw: (roughSvg: RoughSVG) => SVGElement | null,
  dependencies: readonly unknown[]
) {
  const groupRef = useRef<SVGGElement>(null)

  useIsomorphicLayoutEffect(() => {
    const group = groupRef.current
    const svg = group?.ownerSVGElement

    if (!(group && svg)) {
      return
    }

    group.replaceChildren()
    const element = draw(rough.svg(svg))

    if (element) {
      group.appendChild(element)
    }

    return () => {
      group.replaceChildren()
    }
  }, dependencies)

  return groupRef
}

export function RoughPath({
  d,
  options,
}: {
  d: string
  options?: RoughOptions
}) {
  const rough = prepareRoughOptions(options, `path:${d}`)
  const groupRef = useRoughElement(
    (roughSvg) => roughSvg.path(d, rough.options),
    [rough.key]
  )

  return <g ref={groupRef} />
}

export function RoughRect({
  height,
  options,
  width,
  x,
  y,
}: {
  height: number
  options?: RoughOptions
  width: number
  x: number
  y: number
}) {
  const rough = prepareRoughOptions(
    options,
    `rect:${x}:${y}:${width}:${height}`
  )
  const groupRef = useRoughElement(
    (roughSvg) => roughSvg.rectangle(x, y, width, height, rough.options),
    [rough.key]
  )

  return <g ref={groupRef} />
}

export function RoughCircle({
  diameter,
  options,
  x,
  y,
}: {
  diameter: number
  options?: RoughOptions
  x: number
  y: number
}) {
  const rough = prepareRoughOptions(options, `circle:${x}:${y}:${diameter}`)
  const groupRef = useRoughElement(
    (roughSvg) => roughSvg.circle(x, y, diameter, rough.options),
    [rough.key]
  )

  return <g ref={groupRef} />
}

export function RoughPolygon({
  options,
  points,
}: {
  options?: RoughOptions
  points: Array<[number, number]>
}) {
  const rough = prepareRoughOptions(options, `polygon:${stableStringify(points)}`)
  const groupRef = useRoughElement(
    (roughSvg) => roughSvg.polygon(points, rough.options),
    [rough.key]
  )

  return <g ref={groupRef} />
}
