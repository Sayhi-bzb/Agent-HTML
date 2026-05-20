import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[8px] border bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[color:rgba(255,122,26,0.28)] bg-[color:var(--primary)] text-[#12161d] shadow-none hover:brightness-105",
        outline:
          "border-[color:var(--hairline-strong)] bg-[color:var(--card)] text-[color:var(--foreground)] shadow-none hover:bg-[color:var(--canvas-soft)]",
        secondary:
          "border-[color:var(--hairline)] bg-[color:var(--canvas-soft)] text-[color:var(--foreground)] shadow-none hover:bg-[color:var(--card)]",
        ghost:
          "border-transparent bg-transparent text-[color:var(--body)] shadow-none hover:bg-[color:var(--canvas-soft)] hover:text-[color:var(--foreground)]",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "border-transparent bg-transparent px-0 text-[color:var(--body)] underline-offset-4 hover:text-[color:var(--foreground)] hover:underline",
      },
      size: {
        default:
          "h-10 gap-1.5 px-[18px] text-[0.875rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        xs: "h-7 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-[0.8125rem] has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-1.5 px-5 text-[0.875rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
