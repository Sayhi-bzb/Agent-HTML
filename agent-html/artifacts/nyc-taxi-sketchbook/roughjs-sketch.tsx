import { useEffect, useRef } from "react"
import rough from "roughjs"
import type { RoughSVG } from "roughjs/bin/svg"

export type RoughSketchDraw = (roughSvg: RoughSVG, group: SVGGElement) => void

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
