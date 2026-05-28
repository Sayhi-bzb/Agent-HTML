import type { LucideIcon } from "lucide-react"

export type GhostPetPosition = {
  x: number
  y: number
}

export type GhostPetDragState = {
  pointerId: number
  startClientX: number
  startClientY: number
  startPosition: GhostPetPosition
}

export type GhostMenuItem = {
  Icon: LucideIcon
  id: "close" | "focus" | "inspect" | "message" | "pause" | "refresh" | "settings" | "threads"
  label: string
  x: number
  y: number
}
