import type * as React from "react"

import {
  SidebarMenuItem,
  SidebarMenuButton,
} from "#agent-html-playground/components/ui/sidebar"
import { HostControlTrigger } from "./control-trigger"
import { HostItemContent, type HostItemIcon } from "./item-content"

export function HostSidebarActionButton({
  caption,
  className,
  icon,
  label,
  swatchColor,
  trailing,
  ...props
}: Omit<React.ComponentProps<typeof SidebarMenuButton>, "children"> & {
  caption?: React.ReactNode
  icon?: HostItemIcon
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
