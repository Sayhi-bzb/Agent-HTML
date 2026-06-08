import type * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#agent-html-playground/components/ui/select"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#agent-html-playground/components/ui/sidebar"
import { HostControlTrigger } from "./control-trigger"
import { HostItemContent, type HostItemIcon } from "./item-content"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export type HostSelectOption = {
  icon?: HostItemIcon
  label: string
  swatchColor?: string
  value: string
}

export function HostSelect({
  disabled = false,
  label,
  onValueChange,
  options,
  value,
}: {
  disabled?: boolean
  label: string
  onValueChange: (value: string) => void
  options: readonly HostSelectOption[]
  value: string
}) {
  const activeOption = options.find((option) => option.value === value)

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SidebarMenu>
        <SidebarMenuItem>
          <HostSelectTriggerRow
            activeOption={activeOption}
            disabled={disabled}
            label={label}
          />
        </SidebarMenuItem>
      </SidebarMenu>
      <HostSelectContent>
        {options.map((option) => (
          <HostSelectItem
            icon={option.icon}
            key={option.value}
            label={option.label}
            swatchColor={option.swatchColor}
            value={option.value}
          />
        ))}
      </HostSelectContent>
    </Select>
  )
}

function HostSelectTriggerRow({
  activeOption,
  disabled,
  label,
}: {
  activeOption?: HostSelectOption
  disabled: boolean
  label: string
}) {
  return (
    <SelectTrigger asChild>
      <HostControlTrigger asChild>
        <SidebarMenuButton aria-label={label} disabled={disabled} type="button">
          <SelectValue placeholder={label}>
            <HostItemContent
              icon={activeOption?.icon}
              label={activeOption?.label ?? label}
              swatchColor={activeOption?.swatchColor}
            />
          </SelectValue>
          <ChevronDownIcon className="canvas-host-item-icon canvas-host-item-trailing" />
        </SidebarMenuButton>
      </HostControlTrigger>
    </SelectTrigger>
  )
}

export function HostSelectContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <SelectContent
      align="start"
      className={cn(
        "canvas-host-floating-content canvas-host-select-content",
        className
      )}
      position="popper"
    >
      {children}
    </SelectContent>
  )
}

export function HostSelectItem({
  className,
  icon,
  label,
  swatchColor,
  value,
}: HostSelectOption & { className?: string }) {
  return (
    <SelectItem className={cn("canvas-host-select-item", className)} value={value}>
      <span className="canvas-host-select-item-text">
        <HostItemContent icon={icon} label={label} swatchColor={swatchColor} />
      </span>
    </SelectItem>
  )
}
