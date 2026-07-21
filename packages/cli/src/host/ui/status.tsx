import type * as React from "react"
import { ChevronDown } from "lucide-react"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "#agent-html-playground/components/ui/alert"
import { Badge } from "#agent-html-playground/components/ui/badge"
import { Button } from "#agent-html-playground/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#agent-html-playground/components/ui/collapsible"

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
      <AlertDescription className="canvas-host-status-description">
        {children ?? message}
      </AlertDescription>
    </Alert>
  )
}

export function HostStatusDetails({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <Collapsible className="canvas-status-details">
      <CollapsibleTrigger asChild>
        <Button
          className="canvas-status-details-trigger"
          size="xs"
          variant="ghost"
        >
          {label}
          <ChevronDown data-icon="inline-end" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="canvas-status-details-content">
        <code className="canvas-status-details-message">{children}</code>
      </CollapsibleContent>
    </Collapsible>
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
