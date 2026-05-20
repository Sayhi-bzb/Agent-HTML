import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusBadgeTone =
  | "default"
  | "accent"
  | "ready"
  | "dirty"
  | "error"
  | "building"

type StatusBadgeProps = {
  children: ReactNode
  className?: string
  tone?: StatusBadgeTone
}

const toneClassName: Record<StatusBadgeTone, string> = {
  default:
    "border-[color:var(--hairline)] bg-[color:var(--card)] text-[color:var(--body)] hover:bg-[color:var(--card)]",
  accent:
    "border-[color:rgba(255,122,26,0.24)] bg-[color:rgba(255,122,26,0.12)] text-[color:var(--foreground)] hover:bg-[color:rgba(255,122,26,0.12)]",
  ready:
    "border-[color:rgba(91,184,128,0.24)] bg-[color:rgba(91,184,128,0.12)] text-[color:var(--success-ink)] hover:bg-[color:rgba(91,184,128,0.12)]",
  dirty:
    "border-[color:rgba(255,193,90,0.24)] bg-[color:rgba(255,193,90,0.12)] text-[color:var(--warn-ink)] hover:bg-[color:rgba(255,193,90,0.12)]",
  error:
    "border-[color:rgba(255,107,107,0.24)] bg-[color:rgba(255,107,107,0.12)] text-[color:var(--danger-ink)] hover:bg-[color:rgba(255,107,107,0.12)]",
  building:
    "border-[color:rgba(112,153,255,0.24)] bg-[color:rgba(112,153,255,0.12)] text-[color:var(--info-ink)] hover:bg-[color:rgba(112,153,255,0.12)]",
}

export function StatusBadge({
  children,
  className,
  tone = "default",
}: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-[0.3rem] text-[0.72rem] font-medium tracking-[0.01em]",
        toneClassName[tone],
        className,
      )}
      variant="secondary"
    >
      {children}
    </Badge>
  )
}
