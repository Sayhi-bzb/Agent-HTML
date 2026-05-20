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
    "border-[color:rgba(255,255,255,0.07)] bg-[color:rgba(255,255,255,0.02)] text-[color:var(--body)] hover:bg-[color:rgba(255,255,255,0.02)]",
  accent:
    "border-[color:rgba(255,122,26,0.22)] bg-[color:rgba(255,122,26,0.07)] text-[color:#f3d3b8] hover:bg-[color:rgba(255,122,26,0.07)]",
  ready:
    "border-[color:rgba(91,184,128,0.18)] bg-[color:rgba(91,184,128,0.06)] text-[color:var(--success-ink)] hover:bg-[color:rgba(91,184,128,0.06)]",
  dirty:
    "border-[color:rgba(255,193,90,0.18)] bg-[color:rgba(255,193,90,0.06)] text-[color:var(--warn-ink)] hover:bg-[color:rgba(255,193,90,0.06)]",
  error:
    "border-[color:rgba(255,107,107,0.18)] bg-[color:rgba(255,107,107,0.06)] text-[color:var(--danger-ink)] hover:bg-[color:rgba(255,107,107,0.06)]",
  building:
    "border-[color:rgba(112,153,255,0.18)] bg-[color:rgba(112,153,255,0.06)] text-[color:var(--info-ink)] hover:bg-[color:rgba(112,153,255,0.06)]",
}

export function StatusBadge({
  children,
  className,
  tone = "default",
}: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full px-2.25 py-[0.22rem] text-[0.69rem] font-medium tracking-[0.04em]",
        toneClassName[tone],
        className,
      )}
      variant="secondary"
    >
      {children}
    </Badge>
  )
}
