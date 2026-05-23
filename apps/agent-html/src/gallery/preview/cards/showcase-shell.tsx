import * as React from "react"

import { cn } from "@/lib/utils"

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
        "overflow-hidden rounded-[calc(var(--radius)*2)] border border-border/80 bg-card/80 text-card-foreground shadow-[var(--preview-card-shadow)]",
        className
      )}
    >
      <header className="flex flex-col gap-1 border-b border-border/70 px-4 py-4">
        <h2 className="type-heading-3">{title}</h2>
        <p className="type-supporting text-muted-foreground">{description}</p>
      </header>
      <div className={cn("px-4 py-4", bodyClassName)}>{children}</div>
      {footer ? (
        <footer className="border-t border-border/70 bg-muted/35 px-4 py-3 type-supporting text-muted-foreground">
          {footer}
        </footer>
      ) : null}
    </article>
  )
}
