import * as React from "react"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function Button({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"button"> & {
  size?: "default" | "icon-sm"
  variant?: "default" | "ghost" | "outline"
}) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
        variant === "default" &&
          "bg-primary text-primary-foreground hover:bg-primary/80",
        variant === "outline" &&
          "border border-border bg-background hover:bg-muted hover:text-foreground",
        variant === "ghost" && "hover:bg-muted hover:text-foreground",
        size === "default" && "h-8 px-2.5",
        size === "icon-sm" && "size-7",
        className
      )}
      {...props}
    />
  )
}

export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      type={type}
      {...props}
    />
  )
}

export function Alert({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("rounded-md border border-border bg-card p-3", className)}
      role="status"
      {...props}
    />
  )
}

export function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("text-sm font-medium text-card-foreground", className)} {...props} />
  )
}

export function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function Badge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"span"> & {
  variant?: "default" | "secondary"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
}
