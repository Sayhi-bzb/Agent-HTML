import * as React from "react"

import { cn } from "@/app/shared/lib/utils"

const previewCardSurfaceClassName =
  "overflow-hidden rounded-[calc(var(--radius)*2)] border border-border/80 bg-card/80 text-card-foreground shadow-[var(--preview-card-shadow)]"

const previewCardDividerClassName = "border-border/70"

const previewCardQuietSurfaceClassName =
  "bg-muted/35 text-muted-foreground"

export function ShowcaseShell({
  bodyClassName,
  children,
  className,
  description,
  footer,
  title,
}: {
  bodyClassName?: string
  children: React.ReactNode
  className?: string
  description: string
  footer?: React.ReactNode
  title: string
}) {
  return (
    <article
      className={cn(
        previewCardSurfaceClassName,
        className
      )}
    >
      <header
        className={cn(
          "flex flex-col gap-1 border-b px-4 py-4",
          previewCardDividerClassName
        )}
      >
        <h2 className="type-heading-3">{title}</h2>
        <p className="type-supporting text-muted-foreground">{description}</p>
      </header>
      <div className={cn("px-4 py-4", bodyClassName)}>{children}</div>
      {footer ? (
        <footer
          className={cn(
            "border-t px-4 py-3 type-supporting",
            previewCardDividerClassName,
            previewCardQuietSurfaceClassName
          )}
        >
          {footer}
        </footer>
      ) : null}
    </article>
  )
}
