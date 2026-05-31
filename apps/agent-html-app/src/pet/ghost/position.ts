import type { GhostPetPosition } from "@/app/pet/ghost/types"

const GHOST_POSITION_STORAGE_KEY = "agent-html.workspace-ghost-pet-position"
const GHOST_VIEWPORT_MARGIN = 24

function getDefaultPosition(): GhostPetPosition {
  if (typeof window === "undefined") {
    return { x: 0, y: 0 }
  }

  return {
    x: window.innerWidth - 48,
    y: window.innerHeight - 112,
  }
}

export function clampPosition(position: GhostPetPosition): GhostPetPosition {
  if (typeof window === "undefined") {
    return position
  }

  return {
    x: Math.min(
      Math.max(position.x, GHOST_VIEWPORT_MARGIN),
      window.innerWidth - GHOST_VIEWPORT_MARGIN
    ),
    y: Math.min(
      Math.max(position.y, GHOST_VIEWPORT_MARGIN),
      window.innerHeight - GHOST_VIEWPORT_MARGIN
    ),
  }
}

export function loadStoredPosition(): GhostPetPosition {
  if (typeof localStorage === "undefined") {
    return getDefaultPosition()
  }

  try {
    const stored = localStorage.getItem(GHOST_POSITION_STORAGE_KEY)
    if (!stored) {
      return getDefaultPosition()
    }

    const parsed: unknown = JSON.parse(stored)
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "x" in parsed &&
      "y" in parsed &&
      typeof parsed.x === "number" &&
      typeof parsed.y === "number"
    ) {
      return clampPosition({ x: parsed.x, y: parsed.y })
    }
  } catch {
    return getDefaultPosition()
  }

  return getDefaultPosition()
}

export function saveStoredPosition(position: GhostPetPosition) {
  if (typeof localStorage === "undefined") {
    return
  }

  localStorage.setItem(
    GHOST_POSITION_STORAGE_KEY,
    JSON.stringify(clampPosition(position))
  )
}
