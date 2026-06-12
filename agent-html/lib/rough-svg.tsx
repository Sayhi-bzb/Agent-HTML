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
  const groupRef = useRoughElement(
    (roughSvg) => roughSvg.path(d, { ...defaultRoughSvgOptions, ...options }),
    [d, options]
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
  const groupRef = useRoughElement(
    (roughSvg) =>
      roughSvg.rectangle(x, y, width, height, {
        ...defaultRoughSvgOptions,
        ...options,
      }),
    [height, options, width, x, y]
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
  const groupRef = useRoughElement(
    (roughSvg) =>
      roughSvg.circle(x, y, diameter, {
        ...defaultRoughSvgOptions,
        ...options,
      }),
    [diameter, options, x, y]
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
  const groupRef = useRoughElement(
    (roughSvg) =>
      roughSvg.polygon(points, {
        ...defaultRoughSvgOptions,
        ...options,
      }),
    [options, points]
  )

  return <g ref={groupRef} />
}
