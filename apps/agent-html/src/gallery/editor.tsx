import * as React from "react"
import colors from "tailwindcss/colors"
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import {
  galleryColorFamilies,
  galleryColorRoleGroups,
  galleryColorSteps,
  type GalleryColorFamily,
  type GalleryColorStep,
  type GalleryColorTokenName,
  type GalleryColorTokenValue,
  type GalleryColorTokenValues,
} from "@/gallery/editor-panels"
import {
  galleryTypographyBaseSizeOptions,
  galleryTypographyFontOptions,
  galleryTypographyLineHeightOptions,
  type GalleryTypographyValue,
} from "@/gallery/typography"
import type { GalleryEditorMode } from "@/gallery/types"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type TailwindColorScale = Record<GalleryColorStep, string>
const radiusOptions = [
  "0.25rem",
  "0.375rem",
  "0.5rem",
  "0.625rem",
  "0.75rem",
  "1rem",
  "1.25rem",
] as const
type GalleryRadiusValue = (typeof radiusOptions)[number]
const spacingOptions = [
  "0.75rem",
  "1rem",
  "1.25rem",
  "1.5rem",
  "1.75rem",
] as const
type GallerySpacingValue = (typeof spacingOptions)[number]
const shadowOptions = ["none", "soft", "medium", "strong"] as const
type GalleryShadowValue = (typeof shadowOptions)[number]

const tailwindColorFamilies = Object.fromEntries(
  galleryColorFamilies.map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<GalleryColorFamily, TailwindColorScale>

const gallerySidebarPopoverButtonClassName =
  "h-auto min-h-8 items-start py-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"

const gallerySidebarChoiceButtonClassName =
  "text-sidebar-foreground/70 hover:text-sidebar-foreground"

function getTokenColorValue({
  family,
  step,
}: GalleryColorTokenValue) {
  return tailwindColorFamilies[family]?.[step] ?? tailwindColorFamilies.zinc[500]
}

function ColorSwatch({
  className,
  color,
}: {
  className?: string
  color: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "shrink-0 rounded-full ring-1 ring-sidebar-border",
        className
      )}
      style={{ backgroundColor: color }}
    />
  )
}

function ColorSelectTriggerValue({
  color,
  label,
}: {
  color: string
  label: string
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <span className="truncate">{label}</span>
      <ColorSwatch className="size-2.5" color={color} />
    </span>
  )
}

function ColorSelectItemLabel({
  color,
  label,
}: {
  color: string
  label: string
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      <ColorSwatch className="size-2.5" color={color} />
      <span className="truncate">{label}</span>
    </span>
  )
}

function ColorOptionField<Option extends string>({
  getOptionColor,
  isOpen,
  label,
  onOpenChange,
  value,
}: {
  getOptionColor: (option: Option) => string
  isOpen: boolean
  label: string
  onOpenChange: (open: boolean) => void
  value: Option
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <button
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50"
        onClick={() => onOpenChange(!isOpen)}
        type="button"
      >
        <ColorSelectTriggerValue
          color={getOptionColor(value)}
          label={value}
        />
        <ChevronDownIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
    </div>
  )
}

function GallerySidebarSection({
  children,
  collapsible = false,
  defaultOpen = false,
  label,
}: {
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  label: React.ReactNode
}) {
  if (!collapsible) {
    return (
      <SidebarGroup className="px-0">
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>{children}</SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <Collapsible className="group/collapsible" defaultOpen={defaultOpen}>
      <SidebarGroup className="px-0">
        <SidebarGroupLabel
          asChild
          className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <CollapsibleTrigger className="cursor-pointer">
            {label}
            <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>{children}</SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

function GallerySidebarPopoverItem({
  children,
  label,
  popoverClassName = "w-56 p-2",
  trailing,
  valueLabel,
}: {
  children: React.ReactNode
  label: React.ReactNode
  popoverClassName?: string
  trailing?: React.ReactNode
  valueLabel: React.ReactNode
}) {
  return (
    <SidebarMenuItem>
      <Popover>
        <PopoverTrigger asChild>
          <SidebarMenuButton
            className={gallerySidebarPopoverButtonClassName}
            size="sm"
            type="button"
          >
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span>{label}</span>
              <span className="text-xs text-sidebar-foreground/45">
                {valueLabel}
              </span>
            </span>
            {trailing}
          </SidebarMenuButton>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={popoverClassName}
          side="right"
          sideOffset={10}
        >
          {children}
        </PopoverContent>
      </Popover>
    </SidebarMenuItem>
  )
}

function GallerySidebarChoiceMenu({
  activeId,
  onSelect,
  options,
}: {
  activeId: string
  onSelect: (id: string) => void
  options: readonly { id: string; label: string }[]
}) {
  return (
    <SidebarMenu className="gap-0.5">
      {options.map((option) => (
        <SidebarMenuItem key={option.id}>
          <SidebarMenuButton
            className={gallerySidebarChoiceButtonClassName}
            isActive={option.id === activeId}
            onClick={() => onSelect(option.id)}
            size="sm"
            type="button"
          >
            <span>{option.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

function GalleryColorTokenItem({
  label,
  token,
  value,
  onValueChange,
}: {
  label?: string
  token: GalleryColorTokenName
  value: GalleryColorTokenValue
  onValueChange: (value: GalleryColorTokenValue) => void
}) {
  const [activeField, setActiveField] = React.useState<"family" | "step" | null>(
    null
  )
  const swatchColor = getTokenColorValue(value)
  const activeFieldLabel = activeField === "family" ? "Family" : "Step"
  const activeFieldValue = activeField === "family" ? value.family : value.step
  const activeFieldOptions =
    activeField === "family" ? galleryColorFamilies : galleryColorSteps
  const activeFieldGetOptionColor = (option: GalleryColorFamily | GalleryColorStep) =>
    activeField === "family"
      ? getTokenColorValue({
          family: option as GalleryColorFamily,
          step: value.step,
        })
      : getTokenColorValue({
          family: value.family,
          step: option as GalleryColorStep,
        })

  return (
    <GallerySidebarPopoverItem
      label={label ?? token}
      popoverClassName="w-56 overflow-visible p-3"
      trailing={<ColorSwatch className="mt-0.5 size-3" color={swatchColor} />}
      valueLabel={`${value.family} / ${value.step}`}
    >
      <div className="relative flex flex-col gap-3">
        <ColorOptionField
          getOptionColor={(family) =>
            getTokenColorValue({
              family,
              step: value.step,
            })
          }
          isOpen={activeField === "family"}
          label="Family"
          onOpenChange={(open) => setActiveField(open ? "family" : null)}
          value={value.family}
        />

        <ColorOptionField
          getOptionColor={(step) =>
            getTokenColorValue({
              family: value.family,
              step,
            })
          }
          isOpen={activeField === "step"}
          label="Step"
          onOpenChange={(open) => setActiveField(open ? "step" : null)}
          value={value.step}
        />

        {activeField ? (
          <div className="absolute top-0 left-[calc(100%+0.75rem)] z-10 w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground ring-1 ring-foreground/10">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {activeFieldLabel}
            </div>
            <div className="flex flex-col gap-0.5">
              {activeFieldOptions.map((option) => {
                const isActive = option === activeFieldValue

                return (
                  <button
                    key={option}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => {
                      if (activeField === "family") {
                        onValueChange({
                          ...value,
                          family: option as GalleryColorFamily,
                        })
                      } else {
                        onValueChange({
                          ...value,
                          step: option as GalleryColorStep,
                        })
                      }
                      setActiveField(null)
                    }}
                    type="button"
                  >
                    <ColorSelectItemLabel
                      color={activeFieldGetOptionColor(option)}
                      label={option}
                    />
                    {isActive ? <CheckIcon className="size-4 shrink-0" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </GallerySidebarPopoverItem>
  )
}

function GalleryRadiusEditorPanel({
  shadowValue,
  spacingValue,
  value,
  onShadowChange,
  onSpacingChange,
  onValueChange,
}: {
  shadowValue: GalleryShadowValue
  spacingValue: GallerySpacingValue
  value: GalleryRadiusValue
  onShadowChange: (value: GalleryShadowValue) => void
  onSpacingChange: (value: GallerySpacingValue) => void
  onValueChange: (value: GalleryRadiusValue) => void
}) {
  return (
    <div className="flex flex-1 flex-col px-2 py-2">
      <GallerySidebarSection label="Role groups">
        <SidebarMenu className="gap-0.5">
          <GallerySidebarPopoverItem label="radius" valueLabel={value}>
            <GallerySidebarChoiceMenu
              activeId={value}
              onSelect={(radius) => onValueChange(radius as GalleryRadiusValue)}
              options={radiusOptions.map((radius) => ({
                id: radius,
                label: radius,
              }))}
            />
          </GallerySidebarPopoverItem>
          <GallerySidebarPopoverItem label="spacing" valueLabel={spacingValue}>
            <GallerySidebarChoiceMenu
              activeId={spacingValue}
              onSelect={(spacing) =>
                onSpacingChange(spacing as GallerySpacingValue)
              }
              options={spacingOptions.map((spacing) => ({
                id: spacing,
                label: spacing,
              }))}
            />
          </GallerySidebarPopoverItem>
          <GallerySidebarPopoverItem label="shadows" valueLabel={shadowValue}>
            <GallerySidebarChoiceMenu
              activeId={shadowValue}
              onSelect={(shadow) => onShadowChange(shadow as GalleryShadowValue)}
              options={shadowOptions.map((shadow) => ({
                id: shadow,
                label: shadow,
              }))}
            />
          </GallerySidebarPopoverItem>
        </SidebarMenu>
      </GallerySidebarSection>
    </div>
  )
}

function GalleryTypographyEditorPanel({
  onValueChange,
  value,
}: {
  onValueChange: (value: GalleryTypographyValue) => void
  value: GalleryTypographyValue
}) {
  const currentFont =
    galleryTypographyFontOptions.find((font) => font.id === value.fontFamily) ??
    galleryTypographyFontOptions[0]

  return (
    <div className="flex flex-1 flex-col px-2 py-2">
      <GallerySidebarSection label="Role groups">
        <SidebarMenu className="gap-0.5">
          <GallerySidebarPopoverItem
            label="font family"
            valueLabel={currentFont.label}
          >
            <GallerySidebarChoiceMenu
              activeId={value.fontFamily}
              onSelect={(fontFamily) =>
                onValueChange({
                  ...value,
                  fontFamily: fontFamily as GalleryTypographyValue["fontFamily"],
                })
              }
              options={galleryTypographyFontOptions.map((font) => ({
                id: font.id,
                label: font.label,
              }))}
            />
          </GallerySidebarPopoverItem>
          <GallerySidebarPopoverItem
            label="base size"
            valueLabel={value.baseSize}
          >
            <GallerySidebarChoiceMenu
              activeId={value.baseSize}
              onSelect={(baseSize) =>
                onValueChange({
                  ...value,
                  baseSize: baseSize as GalleryTypographyValue["baseSize"],
                })
              }
              options={galleryTypographyBaseSizeOptions.map((size) => ({
                id: size,
                label: size,
              }))}
            />
          </GallerySidebarPopoverItem>
          <GallerySidebarPopoverItem
            label="line height"
            valueLabel={value.lineHeight}
          >
            <GallerySidebarChoiceMenu
              activeId={value.lineHeight}
              onSelect={(lineHeight) =>
                onValueChange({
                  ...value,
                  lineHeight: lineHeight as GalleryTypographyValue["lineHeight"],
                })
              }
              options={galleryTypographyLineHeightOptions.map((lineHeight) => ({
                id: lineHeight,
                label: lineHeight,
              }))}
            />
          </GallerySidebarPopoverItem>
        </SidebarMenu>
      </GallerySidebarSection>
    </div>
  )
}

export function GalleryEditorPanel({
  colorTokenValues,
  mode,
  onColorTokenValueChange,
  onRadiusChange,
  onShadowChange,
  onSpacingChange,
  onTypographyChange,
  radiusValue,
  shadowValue,
  spacingValue,
  typographyValue,
}: {
  colorTokenValues: GalleryColorTokenValues
  mode: GalleryEditorMode
  onColorTokenValueChange: (
    token: GalleryColorTokenName,
    value: GalleryColorTokenValue
  ) => void
  onRadiusChange: (value: GalleryRadiusValue) => void
  onShadowChange: (value: GalleryShadowValue) => void
  onSpacingChange: (value: GallerySpacingValue) => void
  onTypographyChange: (value: GalleryTypographyValue) => void
  radiusValue: GalleryRadiusValue
  shadowValue: GalleryShadowValue
  spacingValue: GallerySpacingValue
  typographyValue: GalleryTypographyValue
}) {
  if (mode === "typography") {
    return (
      <GalleryTypographyEditorPanel
        onValueChange={onTypographyChange}
        value={typographyValue}
      />
    )
  }

  if (mode === "other") {
    return (
      <GalleryRadiusEditorPanel
        onShadowChange={onShadowChange}
        onSpacingChange={onSpacingChange}
        onValueChange={onRadiusChange}
        spacingValue={spacingValue}
        shadowValue={shadowValue}
        value={radiusValue}
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-2 py-2">
      {galleryColorRoleGroups.map((group, index) => (
        <GallerySidebarSection
          key={group.id}
          collapsible
          defaultOpen={index === 0}
          label={group.label}
        >
          <SidebarMenu className="gap-0.5">
            {group.items.map((item) => (
              <GalleryColorTokenItem
                key={item.id}
                label={item.label}
                onValueChange={(value) =>
                  onColorTokenValueChange(item.token, value)
                }
                token={item.token}
                value={colorTokenValues[item.token]}
              />
            ))}
          </SidebarMenu>
        </GallerySidebarSection>
      ))}
    </div>
  )
}

export {
  radiusOptions,
  shadowOptions,
  spacingOptions,
  type GalleryRadiusValue,
  type GalleryShadowValue,
  type GallerySpacingValue,
}
export type { GalleryTypographyValue } from "@/gallery/typography"
