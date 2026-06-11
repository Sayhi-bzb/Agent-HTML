import { useCallback, type ReactNode } from "react"

import { Badge } from "../../components/ui/badge"
import { cn } from "../../lib/cn"

import { roughSketchMarkOptions } from "./rough-theme"
import { RoughSvgLayer, type RoughSketchDraw } from "./roughjs-sketch"

export const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const roughRuleHorizontalPath =
  "M2 10 C48 5, 82 15, 126 9 S204 6, 256 11 S292 16, 318 8"

export function formatCompact(value: number) {
  return Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value)
}

export function formatCurrency(value: number) {
  return Intl.NumberFormat("en", {
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
    style: "currency",
  }).format(value)
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

export function SectionIntro({
  badge,
  children,
  title,
}: {
  badge: string
  children: ReactNode
  title: string
}) {
  return (
    <div className="canvas-stack-sm">
      <Badge variant="secondary">{badge}</Badge>
      <h2 className="canvas-text-heading">{title}</h2>
      <p className="canvas-text-body text-muted-foreground">{children}</p>
    </div>
  )
}

export function SketchPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/15 p-4 md:p-5",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-background/45 before:opacity-50",
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
  )
}

export function RoughRule({
  className,
  direction = "horizontal",
  seed = 1,
}: {
  className?: string
  direction?: "horizontal" | "vertical"
  seed?: number
}) {
  const drawRule = useCallback<RoughSketchDraw>(
    (roughSvg, group) => {
      if (direction === "vertical") {
        group.appendChild(
          roughSvg.line(6, 4, 6, 116, {
            ...roughSketchMarkOptions,
            seed,
            strokeWidth: 1,
          })
        )
        return
      }

      group.appendChild(
        roughSvg.path(roughRuleHorizontalPath, {
          ...roughSketchMarkOptions,
          fill: "none",
          seed,
          strokeWidth: 1,
        })
      )
    },
    [direction, seed]
  )

  return (
    <svg
      aria-hidden="true"
      className={cn(
        direction === "vertical" ? "h-full w-3" : "h-5 w-full",
        className
      )}
      preserveAspectRatio="none"
      viewBox={direction === "vertical" ? "0 0 12 120" : "0 0 320 20"}
    >
      <RoughSvgLayer draw={drawRule} />
    </svg>
  )
}

export function SketchNote({
  children,
  label = "margin note",
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <div className="relative pl-4">
      <RoughRule
        className="absolute inset-y-0 left-0 text-border"
        direction="vertical"
        seed={21}
      />
      <div className="canvas-stack-xs">
        <Badge variant="outline">{label}</Badge>
        <p className="canvas-text-caption text-muted-foreground">{children}</p>
      </div>
    </div>
  )
}

export function SketchAnnotation({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <div className="relative pl-4">
      <RoughRule
        className="absolute inset-y-0 left-0 text-border"
        direction="vertical"
        seed={34}
      />
      <div className="canvas-stack-xs">
        <span className="canvas-text-caption text-muted-foreground">{label}</span>
        <div>{children}</div>
      </div>
    </div>
  )
}

export function LedgerRows({
  items,
}: {
  items: Array<{ label: string; note?: string; value: ReactNode }>
}) {
  return (
    <div className="canvas-stack-xs">
      {items.map((item, index) => (
        <div key={item.label}>
          {index === 0 ? <RoughRule className="text-border/70" seed={55} /> : null}
          <div className="grid gap-2 py-2 text-foreground sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline">
            <div className="canvas-stack-xs">
              <span className="canvas-text-caption text-muted-foreground">
                {item.label}
              </span>
              {item.note ? (
                <span className="canvas-text-caption text-muted-foreground">
                  {item.note}
                </span>
              ) : null}
            </div>
            <strong className="font-mono text-lg font-semibold tracking-normal">
              {item.value}
            </strong>
          </div>
        </div>
      ))}
    </div>
  )
}

export function ScratchLine({ className }: { className?: string }) {
  return <RoughRule className={cn("text-border", className)} seed={8} />
}
