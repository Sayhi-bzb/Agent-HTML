import type { ComponentProps } from "react"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ComposerFieldProps = ComponentProps<typeof Textarea>

export function ComposerField({
  className,
  ...props
}: ComposerFieldProps) {
  return (
    <Textarea
      className={cn("app-shell-composer-field", className)}
      rows={props.rows ?? 1}
      {...props}
    />
  )
}
