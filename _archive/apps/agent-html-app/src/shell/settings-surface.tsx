import * as React from "react"

import { cn } from "@/app/shared/lib/utils"

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

export { SettingsInfoPanel }
