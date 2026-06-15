import type { ReactNode } from "react"

import { Badge } from "../../components/ui/badge"
import { cn } from "../../lib/cn"

export function CaseSection({
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
      <div className="canvas-stack-xs">
        <Badge variant="secondary">{badge}</Badge>
        <h2 className="canvas-text-heading">{title}</h2>
      </div>
      <p className="canvas-text-body text-muted-foreground">{children}</p>
    </div>
  )
}

export function MechanismPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "canvas-content-panel canvas-stack-sm",
        className
      )}
    >
      {children}
    </div>
  )
}

export function MechanismRows({
  items,
}: {
  items: Array<{ label: ReactNode; note?: ReactNode; value: ReactNode }>
}) {
  return (
    <div className="canvas-stack-xs">
      {items.map((item) => (
        <div
          className="canvas-grid-2 border-b border-border py-3 last:border-b-0"
          key={String(item.label)}
        >
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
          <div className="canvas-text-body text-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function SystemLayer({
  index,
  label,
  note,
  signal,
}: {
  index: number
  label: string
  note: string
  signal: string
}) {
  return (
    <div className="canvas-content-panel canvas-grid-2">
      <div className="canvas-icon-box-sm flex items-center justify-center text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="canvas-stack-xs">
        <div className="canvas-wrap-sm items-center justify-between">
          <h3 className="canvas-text-body text-foreground">{label}</h3>
          <Badge variant="outline">{signal}</Badge>
        </div>
        <p className="canvas-text-caption text-muted-foreground">{note}</p>
      </div>
    </div>
  )
}
