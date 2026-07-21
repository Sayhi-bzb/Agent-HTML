import type { ReactNode } from "react"

import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { cn } from "../../lib/cn"

export function CaseSection({
  badge,
  children,
  icon,
  title,
}: {
  badge: string
  children: ReactNode
  icon?: ReactNode
  title: string
}) {
  return (
    <div className="canvas-stack-sm">
      <div className="canvas-wrap-sm items-start">
        {icon ? (
          <span aria-hidden="true" className="mt-0.5 flex shrink-0 text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <div className="canvas-stack-xs">
          <Badge variant="secondary">{badge}</Badge>
          <h2 className="canvas-text-heading canvas-text-strong">{title}</h2>
        </div>
      </div>
      <p className="canvas-text-body text-muted-foreground md:max-w-3xl">
        {children}
      </p>
    </div>
  )
}

export function HandbookPanel({
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
          className="canvas-grid-sidebar grid gap-2"
          key={String(item.label)}
        >
          <div className="canvas-stack-xs">
            <span className="canvas-text-body canvas-text-medium text-foreground">
              {item.label}
            </span>
            {item.note ? (
              <span className="canvas-text-caption text-muted-foreground">
                {item.note}
              </span>
            ) : null}
          </div>
          <div className="canvas-text-body text-muted-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function OpenRows({
  items,
}: {
  items: Array<{ label: ReactNode; meta?: ReactNode; value: ReactNode }>
}) {
  return (
    <div className="canvas-stack-sm">
      {items.map((item) => (
        <div
          className="canvas-grid-sidebar grid gap-2"
          key={String(item.label)}
        >
          <div className="canvas-stack-xs">
            <span className="canvas-text-body canvas-text-medium text-foreground">
              {item.label}
            </span>
            {item.meta ? (
              <span className="canvas-text-caption text-muted-foreground">
                {item.meta}
              </span>
            ) : null}
          </div>
          <div className="canvas-text-caption text-muted-foreground">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export function RouteStepCard({
  action,
  step,
  title,
  value,
}: {
  action: string
  step: string
  title: string
  value: string
}) {
  return (
    <div className="canvas-stack-xs pl-4">
      <span className="canvas-text-caption canvas-text-strong text-primary">{step}</span>
      <h3 className="canvas-text-body canvas-text-medium text-foreground">{title}</h3>
      <span className="canvas-text-caption text-foreground">{action}</span>
      <p className="canvas-text-caption text-muted-foreground">{value}</p>
    </div>
  )
}

export function ChecklistItem({
  checked = true,
  hint,
  label,
  onCheckedChange,
}: {
  checked?: boolean
  hint: string
  label: string
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <div className="canvas-grid-label grid gap-3">
      <Checkbox
        aria-label={label}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange?.(value === true)}
      />
      <div className="canvas-stack-xs">
        <span className="canvas-text-body canvas-text-medium text-foreground">{label}</span>
        <span className="canvas-text-caption text-muted-foreground">
          {hint}
        </span>
      </div>
    </div>
  )
}

export function TopicSampleCard({
  author,
  category,
  focus,
  publishedAt,
  rank,
  signal,
  title,
  url,
}: {
  author: string
  category: string
  focus: ReactNode
  publishedAt: string
  rank: string
  signal: string
  title: string
  url: string
}) {
  return (
    <a
      className="canvas-stack-sm block rounded-md px-0 py-1 text-foreground hover:underline hover:underline-offset-4 focus-visible:underline focus-visible:underline-offset-4"
      href={url}
      rel="noreferrer"
      target="_blank"
    >
      <div className="canvas-wrap-sm items-center justify-between">
        <span className="canvas-text-caption canvas-text-medium text-primary">
          {rank} / {category}
        </span>
        <Badge variant="outline">{signal}</Badge>
      </div>
      <h3 className="canvas-text-body canvas-text-medium text-foreground">{title}</h3>
      <p className="canvas-text-caption text-muted-foreground">
        {author} · {publishedAt}
      </p>
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">{focus}</p>
      </div>
    </a>
  )
}
