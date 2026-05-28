import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/agent-html/lib/utils"

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm leading-none font-medium",
      muted: "text-sm text-muted-foreground",
      "inline-code":
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

function textElementForVariant(variant: TextVariant | null | undefined) {
  if (variant === "h1" || variant === "h2" || variant === "h3" || variant === "h4") {
    return variant
  }

  if (variant === "inline-code") {
    return "code"
  }

  return "p"
}

type TextVariant = NonNullable<VariantProps<typeof textVariants>["variant"]>

type TextProps = React.ComponentProps<"p"> & VariantProps<typeof textVariants>

function getTextProps({ className, variant, ...props }: TextProps) {
  return {
    "data-slot": "text",
    "data-variant": variant ?? "p",
    "data-selection": "text",
    className: cn(textVariants({ variant }), className),
    ...props,
  }
}

function Text(props: TextProps) {
  const element = textElementForVariant(props.variant)
  const textProps = getTextProps(props)

  if (element === "h1") {
    return <h1 {...textProps} />
  }

  if (element === "h2") {
    return <h2 {...textProps} />
  }

  if (element === "h3") {
    return <h3 {...textProps} />
  }

  if (element === "h4") {
    return <h4 {...textProps} />
  }

  if (element === "code") {
    return <code {...textProps} />
  }

  return <p {...textProps} />
}

export { Text }
