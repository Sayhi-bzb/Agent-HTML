import type * as React from "react"

import { Button } from "#agent-html-playground/components/ui/button"
import type { HostItemIcon } from "./item-content"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

type HostIconButtonBaseProps = {
  className?: string
  icon: HostItemIcon
  label: string
  placement?: "prompt" | "toolbar"
  tone?: "neutral" | "primary"
}

type HostIconButtonButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "aria-label" | "children" | "className"
> & {
  href?: never
}

type HostIconButtonLinkProps = Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "aria-label" | "children" | "className"
> &
  Pick<React.ComponentProps<typeof Button>, "size" | "variant"> & {
    href: string
  }

type HostIconButtonProps = HostIconButtonBaseProps &
  (HostIconButtonButtonProps | HostIconButtonLinkProps)

function isHostIconButtonLinkProps(
  props: HostIconButtonButtonProps | HostIconButtonLinkProps
): props is HostIconButtonLinkProps {
  return typeof props.href === "string"
}

export function HostIconButton({
  className,
  icon: Icon,
  label,
  placement,
  tone = "neutral",
  ...props
}: HostIconButtonProps) {
  const iconButtonClassName = cn(
    "canvas-host-icon-button",
    placement === "toolbar" && "canvas-host-toolbar-action",
    placement === "prompt" && "canvas-floating-prompt-submit",
    className
  )

  if (isHostIconButtonLinkProps(props)) {
    const { size, variant, ...anchorProps } = props

    return (
      <Button
        asChild
        className={iconButtonClassName}
        data-tone={tone}
        size={size}
        variant={variant}
      >
        <a aria-label={label} {...anchorProps}>
          <Icon data-icon="inline-start" />
        </a>
      </Button>
    )
  }

  return (
    <Button
      aria-label={label}
      className={iconButtonClassName}
      data-tone={tone}
      type="button"
      {...props}
    >
      <Icon data-icon="inline-start" />
    </Button>
  )
}
