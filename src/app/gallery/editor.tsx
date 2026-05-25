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
} from "@/app/gallery/editor-panels"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/shared/ui/collapsible"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/shared/ui/popover"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/shared/ui/sidebar"
import { cn } from "@/app/shared/lib/utils"

type TailwindColorScale = Record<GalleryColorStep, string>

const tailwindColorFamilies = Object.fromEntries(
  galleryColorFamilies.map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<GalleryColorFamily, TailwindColorScale>

const gallerySidebarPopoverButtonClassName =
  "h-auto min-h-8 items-start py-1.5 text-sidebar-foreground/70 hover:text-sidebar-foreground"

const gallerySidebarSectionTriggerClassName =
  "group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

const galleryEditorPopoverSurfaceClassName =
  "absolute top-0 left-[calc(100%+0.75rem)] z-10 w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground ring-1 ring-foreground/10"

const galleryEditorOptionClassName =
  "flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"

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
          className={gallerySidebarSectionTriggerClassName}
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
          <div className={galleryEditorPopoverSurfaceClassName}>
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
                      galleryEditorOptionClassName,
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

export function GalleryEditorPanel({
  colorTokenValues,
  onColorTokenValueChange,
}: {
  colorTokenValues: GalleryColorTokenValues
  onColorTokenValueChange: (
    token: GalleryColorTokenName,
    value: GalleryColorTokenValue
  ) => void
}) {
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
