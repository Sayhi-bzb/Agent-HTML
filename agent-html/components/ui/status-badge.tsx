import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Status,
  type statusVariants,
} from "@/components/ui/status"

type StatusVariant = NonNullable<
  Parameters<typeof statusVariants>[0]
>["variant"]

export type StatusBadgeProps = React.ComponentProps<typeof Badge> & {
  status?: StatusVariant
}

function StatusBadge({
  children,
  status = "default",
  variant = "outline",
  ...props
}: StatusBadgeProps) {
  return (
    <Badge variant={variant} {...props}>
      <Status size="sm" variant={status} />
      {children}
    </Badge>
  )
}

export { StatusBadge }
