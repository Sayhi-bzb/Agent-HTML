import * as React from "react"

import { cn } from "@/app/shared/lib/utils"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import { Separator } from "@/app/shared/ui/separator"

type PetPanelSize = "auto" | "compact" | "default" | "wide"

const petPanelSizeClassName: Record<PetPanelSize, string> = {
  auto: "w-auto",
  compact: "w-80",
  default: "w-90",
  wide: "w-[34rem]",
}

function PetPanel({
  children,
  className,
  size = "default",
  ...props
}: React.ComponentProps<"section"> & {
  size?: PetPanelSize
}) {
  return (
    <section
      data-slot="pet-panel"
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-md border border-border/70 bg-popover text-sm text-popover-foreground shadow-2xl shadow-black/20",
        petPanelSizeClassName[size],
        className
      )}
      {...props}
    >
      {children}
    </section>
  )
}

function PetPanelHeader({
  actions,
  children,
  className,
  description,
  icon,
  title,
  ...props
}: React.ComponentProps<"header"> & {
  actions?: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  title?: React.ReactNode
}) {
  return (
    <header
      data-popover-no-drag
      data-selection="none"
      data-slot="pet-panel-header"
      className={cn(
        "flex shrink-0 items-start justify-between gap-3 px-4 py-3",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              {icon ? <span className="shrink-0 text-primary">{icon}</span> : null}
              <h2 className="truncate text-sm font-semibold">{title}</h2>
            </div>
            {description ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="shrink-0" data-slot="pet-panel-header-actions">
              {actions}
            </div>
          ) : null}
        </>
      )}
    </header>
  )
}

function PetPanelBody({
  children,
  className,
  scroll = true,
  viewportClassName,
  ...props
}: React.ComponentProps<typeof ScrollArea> & {
  scroll?: boolean
  viewportClassName?: string
}) {
  if (!scroll) {
    return (
      <div
        data-slot="pet-panel-body"
        className={cn("min-h-0 flex-1 px-4 py-3", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <ScrollArea
      data-popover-no-drag
      data-slot="pet-panel-body"
      className={cn("min-h-0 flex-1", className)}
      viewportClassName={cn("p-3", viewportClassName)}
      {...props}
    >
      {children}
    </ScrollArea>
  )
}

function PetPanelFooter({
  className,
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer
      data-popover-no-drag
      data-selection="none"
      data-slot="pet-panel-footer"
      className={cn(
        "flex shrink-0 items-center justify-end gap-2 px-4 py-3",
        className
      )}
      {...props}
    />
  )
}

function PetPanelSection({
  as: Comp = "div",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  as?: "article" | "div"
}) {
  return (
    <Comp
      data-slot="pet-panel-section"
      className={cn(
        "rounded-md border border-border/70 bg-background/70",
        className
      )}
      {...props}
    />
  )
}

function PetPanelEmptyState({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="pet-panel-empty-state"
      className={cn(
        "rounded-md border border-dashed border-border/80 bg-muted/30 px-3 py-8 text-center text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function PetPanelSeparator(props: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="pet-panel-separator" {...props} />
}

export {
  PetPanel,
  PetPanelBody,
  PetPanelEmptyState,
  PetPanelFooter,
  PetPanelHeader,
  PetPanelSection,
  PetPanelSeparator,
}
