import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"

type WorkbenchCardProps = {
  header: ReactNode
  children: ReactNode
}

export function WorkbenchCard({ header, children }: WorkbenchCardProps) {
  return (
    <Card className="app-shell-fill-card">
      {header}
      <CardContent className="app-shell-content-stack">{children}</CardContent>
    </Card>
  )
}
