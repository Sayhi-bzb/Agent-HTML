import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Toggle as TogglePrimitive } from "radix-ui"

import { cn } from "@/lib/cn"

const toggleVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-transparent bg-transparent px-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-muted data-[state=on]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
        outline: "border-border bg-background dark:border-input dark:bg-input/30",
      },
      size: {
        default: "h-8",
        sm: "h-7 rounded-[min(var(--radius-md),12px)] px-2 text-[0.8rem]",
        lg: "h-9 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      className={cn(toggleVariants({ variant, size, className }))}
      data-size={size}
      data-slot="toggle"
      data-variant={variant}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
