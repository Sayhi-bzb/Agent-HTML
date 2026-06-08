import type * as React from "react"

import { HostSwatch } from "./swatch"

export type HostItemIcon = React.ComponentType<{ className?: string }>

export function HostItemContent({
  caption,
  icon: Icon,
  label,
  shortcut,
  swatchColor,
  trailing,
}: {
  caption?: React.ReactNode
  icon?: HostItemIcon
  label: React.ReactNode
  shortcut?: React.ReactNode
  swatchColor?: string
  trailing?: React.ReactNode
}) {
  return (
    <span className="canvas-host-item-content">
      {swatchColor ? <HostSwatch color={swatchColor} size="xs" /> : null}
      {Icon ? <Icon className="canvas-host-item-icon" /> : null}
      <span className="canvas-host-item-text">
        <span className="canvas-host-item-label">{label}</span>
        {caption ? (
          <span className="canvas-host-item-caption">{caption}</span>
        ) : null}
      </span>
      {shortcut ? (
        <span className="canvas-host-item-shortcut">{shortcut}</span>
      ) : null}
      {trailing ? (
        <span className="canvas-host-item-trailing">{trailing}</span>
      ) : null}
    </span>
  )
}
