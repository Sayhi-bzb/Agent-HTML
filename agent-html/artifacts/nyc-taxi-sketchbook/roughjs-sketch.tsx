import { useEffect, useRef } from "react"
import rough from "roughjs"
import type { RoughSVG } from "roughjs/bin/svg"

export type RoughSketchDraw = (roughSvg: RoughSVG, group: SVGGElement) => void

export const roughSketchMarkOptions = {
  fillStyle: "hachure",
  fillWeight: 1,
  roughness: 4,
  stroke: "currentColor",
  strokeWidth: 1,
}

export function RoughSvgLayer({
  draw,
}: {
  draw: RoughSketchDraw
}) {
  const groupRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const group = groupRef.current
    const svg = group?.ownerSVGElement
    if (!group || !svg) return

    group.replaceChildren()
    draw(rough.svg(svg), group)

    return () => {
      group.replaceChildren()
    }
  }, [draw])

  return <g ref={groupRef} />
}
