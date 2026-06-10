import type { ReactNode } from "react"

import { Badge } from "../../components/ui/badge"
import { cn } from "../../lib/cn"

export const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

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
        "relative overflow-hidden rounded-md border border-border bg-background p-4 shadow-xs md:p-5",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-muted/20 before:opacity-40",
        className
      )}
    >
      <div className="relative">{children}</div>
    </div>
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
    <div className="canvas-stack-xs border-l border-dashed border-border pl-4">
      <Badge variant="outline">{label}</Badge>
      <p className="canvas-text-caption text-muted-foreground">{children}</p>
    </div>
  )
}

export function MetricStrip({
  items,
}: {
  items: Array<{ label: string; value: string; note?: string }>
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <SketchPanel className="p-4" key={item.label}>
          <div className="canvas-stack-xs">
            <span className="canvas-text-caption text-muted-foreground">
              {item.label}
            </span>
            <strong className="font-mono text-2xl font-semibold tracking-normal">
              {item.value}
            </strong>
            {item.note ? (
              <span className="canvas-text-caption text-muted-foreground">
                {item.note}
              </span>
            ) : null}
          </div>
        </SketchPanel>
      ))}
    </div>
  )
}

export function ScratchLine({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-4 w-full text-border", className)}
      preserveAspectRatio="none"
      viewBox="0 0 320 18"
    >
      <path
        d="M2 10 C48 5, 82 15, 126 9 S204 6, 256 11 S300 14, 318 8"
        fill="none"
        stroke="currentColor"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
    </svg>
  )
}
