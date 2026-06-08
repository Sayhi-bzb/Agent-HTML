import type * as React from "react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#agent-html-playground/components/ui/alert"
import { Badge } from "#agent-html-playground/components/ui/badge"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function HostStatusSurface({
  children,
  className,
  message,
  title,
}: {
  children?: React.ReactNode
  className?: string
  message?: React.ReactNode
  title: React.ReactNode
}) {
  return (
    <Alert className={cn("canvas-host-status", className)}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children ?? message}</AlertDescription>
    </Alert>
  )
}

export function HostStatusList({ children }: { children: React.ReactNode }) {
  return <div className="canvas-status-stack">{children}</div>
}

export function HostStatusItem({
  badge,
  children,
}: {
  badge?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <p className="canvas-status-item">
      {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      <span className="canvas-status-message">{children}</span>
    </p>
  )
}

export const HostStatus = {
  Item: HostStatusItem,
  List: HostStatusList,
  Surface: HostStatusSurface,
}
