import { useCallback, type ReactNode } from "react"

import { Badge } from "../../components/ui/badge"
import { cn } from "../../lib/cn"

import { roughSketchMarkOptions } from "./rough-theme"
import { RoughSvgLayer, type RoughSketchDraw } from "./roughjs-sketch"

export const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const ledgerRuleSeeds = [55, 83, 62, 97]
const roughRuleHorizontalPaths = [
  "M2 10 C48 5, 82 15, 126 9 S204 6, 256 11 S292 16, 318 8",
  "M1 8 C38 13, 77 6, 118 10 S198 14, 242 8 S292 5, 319 12",
  "M3 12 C54 9, 88 6, 132 13 S211 8, 254 11 S288 15, 319 7",
]
const roughRuleVerticalPaths = [
  "M6 4 C4 24, 8 45, 6 65 S4 102, 7 116",
  "M5 3 C8 26, 4 47, 7 70 S5 97, 6 117",
]
const roughPanelPaths = [
  "M10 9 C88 3, 208 7, 309 6 S519 13, 630 8 L636 146 C535 152, 418 147, 304 151 S86 145, 8 150 Z",
  "M8 12 C103 7, 196 11, 322 8 S520 5, 632 12 L630 151 C532 146, 421 153, 311 148 S108 154, 11 146 Z",
  "M12 7 C95 13, 215 4, 318 10 S520 12, 634 7 L637 148 C548 154, 405 146, 302 152 S96 144, 7 150 Z",
]
type RoughLineTone = "annotation" | "section" | "structure" | "table"

const roughLineTones: Record<
  RoughLineTone,
  { className: string; stroke: string; strokeWidth: number }
> = {
  annotation: {
    className: "text-chart-3/75",
    stroke: "var(--chart-3)",
    strokeWidth: 1.1,
  },
  section: {
    className: "text-foreground/70",
    stroke: "var(--foreground)",
    strokeWidth: 1,
  },
  structure: {
    className: "text-muted-foreground/35",
    stroke: "var(--muted-foreground)",
    strokeWidth: 0.8,
  },
  table: {
    className: "text-border/45",
    stroke: "var(--border)",
    strokeWidth: 0.75,
  },
}

function pickSketchVariant<T>(items: readonly T[], seed: number) {
  return items[Math.abs(seed) % items.length]
}

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
    <div className="canvas-stack-xs">
      <div className="grid gap-3 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] md:items-end">
        <div className="canvas-stack-xs">
          <Badge variant="secondary">{badge}</Badge>
          <h2 className="canvas-text-heading">{title}</h2>
        </div>
        <p className="canvas-text-caption text-muted-foreground md:max-w-2xl">
          {children}
        </p>
      </div>
      <RoughRule seed={13} tone="section" />
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
  const drawPanel = useCallback<RoughSketchDraw>((roughSvg, group) => {
    group.appendChild(
      roughSvg.path(pickSketchVariant(roughPanelPaths, 44), {
        ...roughSketchMarkOptions,
        fill: "var(--muted)",
        fillWeight: 0.45,
        hachureGap: 9,
        roughness: 3.5,
        seed: 44,
        stroke: roughLineTones.structure.stroke,
        strokeWidth: 0.25,
      })
    )
  }, [])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-background p-4 md:p-5",
        className
      )}
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-45"
        preserveAspectRatio="none"
        viewBox="0 0 640 160"
      >
        <RoughSvgLayer draw={drawPanel} />
      </svg>
      <div className="relative">{children}</div>
    </div>
  )
}

export function RoughTableShell({
  children,
}: {
  children: ReactNode
}) {
  const drawTableShell = useCallback<RoughSketchDraw>((roughSvg, group) => {
    group.appendChild(
      roughSvg.path(pickSketchVariant(roughPanelPaths, 68), {
        ...roughSketchMarkOptions,
        fill: "var(--background)",
        fillWeight: 0.35,
        hachureGap: 10,
        roughness: 3.8,
        seed: 68,
        stroke: roughLineTones.structure.stroke,
        strokeWidth: 0.2,
      })
    )
  }, [])

  return (
    <div className="relative overflow-hidden rounded-md bg-background p-3">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        preserveAspectRatio="none"
        viewBox="0 0 640 160"
      >
        <RoughSvgLayer draw={drawTableShell} />
      </svg>
      <div className="relative">{children}</div>
    </div>
  )
}

export function RoughRule({
  className,
  direction = "horizontal",
  seed = 1,
  tone = "table",
}: {
  className?: string
  direction?: "horizontal" | "vertical"
  seed?: number
  tone?: RoughLineTone
}) {
  const toneStyle = roughLineTones[tone]
  const drawRule = useCallback<RoughSketchDraw>(
    (roughSvg, group) => {
      if (direction === "vertical") {
        group.appendChild(
          roughSvg.path(pickSketchVariant(roughRuleVerticalPaths, seed), {
            ...roughSketchMarkOptions,
            fill: "none",
            seed,
            stroke: toneStyle.stroke,
            strokeWidth: toneStyle.strokeWidth,
          })
        )
        return
      }

      group.appendChild(
        roughSvg.path(pickSketchVariant(roughRuleHorizontalPaths, seed), {
          ...roughSketchMarkOptions,
          fill: "none",
          seed,
          stroke: toneStyle.stroke,
          strokeWidth: toneStyle.strokeWidth,
        })
      )
    },
    [direction, seed, toneStyle]
  )

  return (
    <svg
      aria-hidden="true"
      className={cn(
        direction === "vertical" ? "h-full w-3" : "h-5 w-full",
        toneStyle.className,
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
        className="absolute inset-y-0 left-0"
        direction="vertical"
        seed={21}
        tone="annotation"
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
        className="absolute inset-y-0 left-0"
        direction="vertical"
        seed={34}
        tone="annotation"
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
          {index === 0 ? (
            <RoughRule
              seed={ledgerRuleSeeds[index % ledgerRuleSeeds.length] + index}
              tone="table"
            />
          ) : null}
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
  return <RoughRule className={className} seed={8} tone="section" />
}
