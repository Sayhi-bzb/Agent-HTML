import * as React from "react"
import type { ReactNode } from "react"

import { cn } from "@/lib/cn"

export function ChartInteractionRoot({
  children,
  className,
  onPointerLeave,
  onPointerMove,
}: {
  children: ReactNode
  className?: string
  onPointerLeave: () => void
  onPointerMove?: React.PointerEventHandler<HTMLDivElement>
}) {
  React.useEffect(() => onPointerLeave, [onPointerLeave])

  return (
    <div
      className={cn("relative h-full w-full", className)}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
    >
      {children}
    </div>
  )
}

export function ChartSvg({
  children,
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={cn("h-full w-full overflow-visible", className)} {...props}>
      {children}
    </svg>
  )
}

export function ChartHitPath({
  d,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
}: {
  d: string
  onPointerEnter?: React.PointerEventHandler<SVGPathElement>
  onPointerLeave?: React.PointerEventHandler<SVGPathElement>
  onPointerMove?: React.PointerEventHandler<SVGPathElement>
}) {
  return (
    <path
      d={d}
      fill="transparent"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      pointerEvents="all"
      stroke="transparent"
    />
  )
}

export function ChartHitRect({
  height,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  width,
  x,
  y,
}: {
  height: number
  onPointerEnter?: React.PointerEventHandler<SVGRectElement>
  onPointerLeave?: React.PointerEventHandler<SVGRectElement>
  onPointerMove?: React.PointerEventHandler<SVGRectElement>
  width: number
  x: number
  y: number
}) {
  return (
    <rect
      fill="transparent"
      height={height}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      pointerEvents="all"
      stroke="transparent"
      width={width}
      x={x}
      y={y}
    />
  )
}

export function ChartHitCircle({
  ariaLabel,
  className,
  cx,
  cy,
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  r,
  tabIndex,
}: {
  ariaLabel?: string
  className?: string
  cx: number
  cy: number
  onPointerEnter?: React.PointerEventHandler<SVGCircleElement>
  onPointerLeave?: React.PointerEventHandler<SVGCircleElement>
  onPointerMove?: React.PointerEventHandler<SVGCircleElement>
  r: number
  tabIndex?: number
}) {
  return (
    <circle
      aria-label={ariaLabel}
      className={className}
      cx={cx}
      cy={cy}
      fill="transparent"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      pointerEvents="all"
      r={r}
      stroke="transparent"
      tabIndex={tabIndex}
    />
  )
}

export function ChartHitLine({
  onPointerEnter,
  onPointerLeave,
  onPointerMove,
  strokeWidth,
  x1,
  x2,
  y1,
  y2,
}: {
  onPointerEnter?: React.PointerEventHandler<SVGLineElement>
  onPointerLeave?: React.PointerEventHandler<SVGLineElement>
  onPointerMove?: React.PointerEventHandler<SVGLineElement>
  strokeWidth: number
  x1: number
  x2: number
  y1: number
  y2: number
}) {
  return (
    <line
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerMove={onPointerMove}
      pointerEvents="stroke"
      stroke="transparent"
      strokeLinecap="round"
      strokeWidth={strokeWidth}
      x1={x1}
      x2={x2}
      y1={y1}
      y2={y2}
    />
  )
}
