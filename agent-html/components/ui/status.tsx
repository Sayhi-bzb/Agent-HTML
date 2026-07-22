"use client"

import type React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/cn"

export const statusVariants = tv({
  base: [
    "shrink-0 rounded-full",
    "flex items-center justify-center",
    "font-medium text-2xs",
    "ring-2 ring-background",
  ],
  variants: {
    variant: {
      default: "bg-foreground text-background",
      success: "bg-success text-success-foreground",
      info: "bg-info text-info-foreground",
      warning: "bg-warning text-warning-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    },
    size: {
      sm: "size-2 [&_svg:not([class*='size-'])]:size-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      md: "size-2.5 [&_svg:not([class*='size-'])]:size-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
      lg: "size-3 [&_svg:not([class*='size-'])]:size-2.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

interface StatusProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof statusVariants> {}

export const Status = (props: StatusProps) => {
  const { variant, size, className, ...rest } = props

  return (
    <span
      className={cn(statusVariants({ variant, size }), className)}
      data-size={size}
      data-slot="status-indicator"
      {...rest}
    />
  )
}
