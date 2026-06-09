import type * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#agent-html-playground/components/ui/select"
import { Button } from "#agent-html-playground/components/ui/button"
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

type HostSelectLayout = "compact" | "floating" | "sidebar"

export function HostSelect({
  disabled = false,
  label,
  layout = "sidebar",
  onValueChange,
  options,
  triggerLabel,
  value,
}: {
  disabled?: boolean
  label: string
  layout?: HostSelectLayout
  onValueChange: (value: string) => void
  options: readonly HostSelectOption[]
  triggerLabel?: string
  value: string
}) {
  const activeOption = options.find((option) => option.value === value)
  const trigger = (
    <HostSelectTriggerRow
      activeOption={activeOption}
      disabled={disabled}
      label={label}
      layout={layout}
      triggerLabel={triggerLabel}
    />
  )

  return (
    <Select onValueChange={onValueChange} value={value}>
      {layout === "sidebar" ? (
        <SidebarMenu>
          <SidebarMenuItem>{trigger}</SidebarMenuItem>
        </SidebarMenu>
      ) : (
        trigger
      )}
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
  layout,
  triggerLabel,
}: {
  activeOption?: HostSelectOption
  disabled: boolean
  label: string
  layout: HostSelectLayout
  triggerLabel?: string
}) {
  const rowContent = (
    <>
      <SelectValue placeholder={label}>
        <HostItemContent
          caption={triggerLabel ? activeOption?.label : undefined}
          icon={activeOption?.icon}
          label={triggerLabel ?? activeOption?.label ?? label}
          swatchColor={activeOption?.swatchColor}
        />
      </SelectValue>
      <ChevronDownIcon className="canvas-host-item-icon canvas-host-item-trailing" />
    </>
  )
  const compactContent = (
    <>
      <SelectValue placeholder={label}>
        <span className="canvas-host-select-compact-value">
          {activeOption?.label ?? label}
        </span>
      </SelectValue>
      <ChevronDownIcon className="canvas-host-item-icon canvas-host-item-trailing" />
    </>
  )

  return (
    <SelectTrigger asChild>
      {layout === "sidebar" ? (
        <HostControlTrigger asChild>
          <SidebarMenuButton aria-label={label} disabled={disabled} type="button">
            {rowContent}
          </SidebarMenuButton>
        </HostControlTrigger>
      ) : layout === "compact" ? (
        <Button
          aria-label={label}
          className="canvas-host-select-compact-trigger"
          disabled={disabled}
          size="default"
          type="button"
          variant="ghost"
        >
          {compactContent}
        </Button>
      ) : (
        <Button
          aria-label={label}
          className="canvas-host-control-trigger canvas-host-popover-action"
          disabled={disabled}
          size="default"
          type="button"
          variant="ghost"
        >
          {rowContent}
        </Button>
      )}
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
