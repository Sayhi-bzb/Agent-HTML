import type * as React from "react"

import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "#agent-html-playground/components/ui/sidebar"
import { HostControlTrigger } from "./control-trigger"
import {
  HostItemContent,
  type HostItemIcon,
  type HostItemLayout,
} from "./item-content"

export function HostSidebarActionButton({
  caption,
  className,
  icon,
  itemLayout,
  label,
  swatchColor,
  trailing,
  ...props
}: Omit<React.ComponentProps<typeof SidebarMenuButton>, "children"> & {
  caption?: React.ReactNode
  icon?: HostItemIcon
  itemLayout?: HostItemLayout
  label: React.ReactNode
  swatchColor?: string
  trailing?: React.ReactNode
}) {
  return (
    <HostControlTrigger asChild className={className}>
      <SidebarMenuButton {...props}>
        <HostItemContent
          caption={caption}
          icon={icon}
          layout={itemLayout}
          label={label}
          swatchColor={swatchColor}
          trailing={trailing}
        />
      </SidebarMenuButton>
    </HostControlTrigger>
  )
}

export function HostSidebarAction({
  children,
  ...props
}: React.ComponentProps<typeof HostSidebarActionButton> & {
  children?: React.ReactNode
}) {
  return (
    <SidebarMenuItem>
      <HostSidebarActionButton {...props} />
      {children}
    </SidebarMenuItem>
  )
}

export function HostSidebarStatus({
  caption,
  className,
  icon,
  itemLayout,
  label,
  swatchColor,
  trailing,
}: {
  caption?: React.ReactNode
  className?: string
  icon?: HostItemIcon
  itemLayout?: HostItemLayout
  label: React.ReactNode
  swatchColor?: string
  trailing?: React.ReactNode
}) {
  return (
    <SidebarMenuItem>
      <div className={["canvas-host-sidebar-status", className].filter(Boolean).join(" ")}>
        <HostItemContent
          caption={caption}
          icon={icon}
          layout={itemLayout}
          label={label}
          swatchColor={swatchColor}
          trailing={trailing}
        />
      </div>
    </SidebarMenuItem>
  )
}
