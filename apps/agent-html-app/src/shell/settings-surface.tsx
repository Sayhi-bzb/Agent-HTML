import * as React from "react"

import { cn } from "@/app/shared/lib/utils"

function SettingsStatusPanel({
  action,
  className,
  description,
  label,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  action?: React.ReactNode
  description?: React.ReactNode
  label: React.ReactNode
}) {
  return (
    <div
      data-slot="settings-status-panel"
      data-selection="none"
      className={cn(
        "flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2",
        className
      )}
      {...props}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="truncate text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div data-slot="settings-status-panel-action" className="shrink-0">
          {action}
        </div>
      ) : null}
    </div>
  )
}

function SettingsInfoPanel({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "destructive"
}) {
  return (
    <div
      data-slot="settings-info-panel"
      data-selection="text"
      data-cursor="text"
      data-variant={variant}
      className={cn(
        "rounded-lg border px-3 py-2 text-sm text-muted-foreground",
        variant === "destructive" &&
          "border-destructive/30 bg-destructive/5 text-destructive",
        className
      )}
      {...props}
    />
  )
}

function SettingsDiagnosticsList({
  className,
  items,
  ...props
}: React.ComponentProps<"dl"> & {
  items: Array<{
    label: React.ReactNode
    span?: "default" | "full"
    value: React.ReactNode
  }>
}) {
  return (
    <dl
      data-slot="settings-diagnostics-list"
      className={cn(
        "grid gap-2 rounded-lg border p-3 text-xs sm:grid-cols-2",
        className
      )}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(item.span === "full" && "sm:col-span-2")}
        >
          <dt data-selection="none" className="text-muted-foreground">
            {item.label}
          </dt>
          <dd data-selection="text" data-cursor="text" className="break-all">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export { SettingsDiagnosticsList, SettingsInfoPanel, SettingsStatusPanel }
