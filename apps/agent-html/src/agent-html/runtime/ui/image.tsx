import * as React from "react"

import { cn } from "@/lib/utils"

function Image({
  className,
  fit = "cover",
  ...props
}: React.ComponentProps<"img"> & { fit?: "cover" | "contain" }) {
  return (
    <img
      data-slot="image"
      className={cn(
        "block h-full w-full rounded-lg",
        fit === "contain" ? "object-contain" : "object-cover",
        className
      )}
      {...props}
    />
  )
}

export { Image }
