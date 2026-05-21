import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"

type ShellCardFrameProps = {
  children: ReactNode
  className?: string
}

export function ShellCardFrame({ children, className }: ShellCardFrameProps) {
  return (
    <Card className={className} size="sm">
      {children}
    </Card>
  )
}
