import { useRef } from "react"
import rough from "roughjs"
import type { Options as RoughOptions } from "roughjs/bin/core"

import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"

export const defaultRoughOptions: RoughOptions = {
  bowing: 0.8,
  fillStyle: "hachure",
  roughness: 1.3,
}

function useRoughElement(
  draw: (roughSvg: ReturnType<typeof rough.svg>) => SVGElement | null,
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
    (roughSvg) => roughSvg.path(d, { ...defaultRoughOptions, ...options }),
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
        ...defaultRoughOptions,
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
        ...defaultRoughOptions,
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
        ...defaultRoughOptions,
        ...options,
      }),
    [options, points]
  )

  return <g ref={groupRef} />
}
