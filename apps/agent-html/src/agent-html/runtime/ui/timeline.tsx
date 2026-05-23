import * as React from "react"
import { CheckIcon } from "lucide-react"

import { IconRuntime } from "@/agent-html/runtime/render/icon-runtime"
import { timelineItemDefaults } from "@/agent-html/schema/defaults"
import { cn } from "@/lib/utils"

function Timeline({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("relative ml-4", className)}
      data-slot="timeline"
      {...props}
    />
  )
}

function TimelineItem({
  children,
  className,
  icon,
  meta,
  status = timelineItemDefaults.status,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: string
  meta?: string
  status?: "default" | "complete" | "current" | "muted"
}) {
  return (
    <div
      className={cn(
        "relative border-l-2 pb-10 pl-10 last:pb-0",
        status === "muted" && "opacity-70",
        className
      )}
      data-slot="timeline-item"
      data-status={status}
      {...props}
    >
      <span
        className={cn(
          "absolute left-0 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border bg-background text-muted-foreground ring-8 ring-background",
          status === "complete" &&
            "border-primary bg-primary text-primary-foreground",
          status === "current" && "border-primary text-primary"
        )}
        data-slot="timeline-marker"
      >
        {status === "complete" ? (
          <CheckIcon className="size-4" />
        ) : icon ? (
          <IconRuntime name={icon} />
        ) : (
          <span className="size-2 rounded-full bg-current" />
        )}
      </span>
      <div className="space-y-2 pt-1" data-slot="timeline-item-content">
        {meta ? (
          <div className="text-sm text-muted-foreground" data-slot="timeline-meta">
            {meta}
          </div>
        ) : null}
        {children}
      </div>
    </div>
  )
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-xl font-medium tracking-[-0.01em]", className)}
      data-slot="timeline-title"
      {...props}
    />
  )
}

function TimelineDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-pretty text-muted-foreground", className)}
      data-slot="timeline-description"
      {...props}
    />
  )
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("pt-1", className)}
      data-slot="timeline-content"
      {...props}
    />
  )
}

export {
  Timeline,
  TimelineItem,
  TimelineTitle,
  TimelineDescription,
  TimelineContent,
}
