import type { ComponentProps, ReactNode } from "react"

import { cn } from "../../lib/cn"

type ReviewSectionHeaderProps = {
  children?: ReactNode
  className?: string
  eyebrow: string
  title: string
}

export function ReviewSectionHeader({
  children,
  className,
  eyebrow,
  title,
}: ReviewSectionHeaderProps) {
  return (
    <div className={cn("canvas-stack-xs", className)}>
      <p className="canvas-text-caption text-muted-foreground">{eyebrow}</p>
      <h2 className="canvas-text-heading">{title}</h2>
      {children ? (
        <p className="max-w-4xl canvas-text-body text-muted-foreground">
          {children}
        </p>
      ) : null}
    </div>
  )
}

export function ReviewPanel({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-md bg-background p-4", className)}
      {...props}
    />
  )
}

export function ReviewMetricValue({
  className,
  ...props
}: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "canvas-text-heading canvas-text-mono tabular-nums text-foreground",
        className
      )}
      {...props}
    />
  )
}

export function ReviewStage({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <ReviewPanel
      className={cn("min-w-0 overflow-hidden", className)}
      {...props}
    />
  )
}

export function ReviewRailGrid({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cn("canvas-grid-cards", className)}
      {...props}
    />
  )
}
