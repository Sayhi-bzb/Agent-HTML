import * as React from "react"
import colors from "tailwindcss/colors"
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import {
  appColorFamilies,
  appColorRoleGroups,
  appColorSteps,
  type AppColorFamily,
  type AppColorStep,
  type AppColorTokenName,
  type AppColorTokenValue,
  type AppColorTokenValues,
  type AppThemeCssVariables,
} from "@/app/shared/app-theme/tokens"
import {
  appThemeFontOptions,
  createAppThemeShadowScaleVariables,
  formatAppThemeCssNumber,
  getAppThemeCssVariableValue,
  parseAppThemeCssNumber,
  type AppThemeEditableVariableName,
} from "@/app/shared/app-theme/variables"
import type { GalleryThemeEditorSectionId } from "@/app/gallery/theme-editor-sections"
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

type TailwindColorScale = Record<AppColorStep, string>

const tailwindColorFamilies = Object.fromEntries(
  appColorFamilies.map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<AppColorFamily, TailwindColorScale>

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
}: AppColorTokenValue) {
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
              <span className="truncate">{label}</span>
              <span className="truncate text-xs text-sidebar-foreground/45">
                {valueLabel}
              </span>
            </span>
            {trailing ? (
              <span className="flex shrink-0 items-center">{trailing}</span>
            ) : null}
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
  token: AppColorTokenName
  value: AppColorTokenValue
  onValueChange: (value: AppColorTokenValue) => void
}) {
  const [activeField, setActiveField] = React.useState<"family" | "step" | null>(
    null
  )
  const swatchColor = getTokenColorValue(value)
  const activeFieldLabel = activeField === "family" ? "Family" : "Step"
  const activeFieldValue = activeField === "family" ? value.family : value.step
  const activeFieldOptions =
    activeField === "family" ? appColorFamilies : appColorSteps
  const activeFieldGetOptionColor = (option: AppColorFamily | AppColorStep) =>
    activeField === "family"
      ? getTokenColorValue({
          family: option as AppColorFamily,
          step: value.step,
        })
      : getTokenColorValue({
          family: value.family,
          step: option as AppColorStep,
        })

  return (
    <GallerySidebarPopoverItem
      label={label ?? token}
      popoverClassName="w-56 overflow-visible p-3"
      trailing={<ColorSwatch className="size-3" color={swatchColor} />}
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
                          family: option as AppColorFamily,
                        })
                      } else {
                        onValueChange({
                          ...value,
                          step: option as AppColorStep,
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

function GalleryThemeSelectItem({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string
  onValueChange: (value: string) => void
  options: readonly { label: string; value: string }[]
  value: string
}) {
  const activeOption = options.find((option) => option.value === value)

  return (
    <GallerySidebarPopoverItem
      label={label}
      popoverClassName="w-60 p-1"
      valueLabel={activeOption?.label ?? value}
    >
      <div className="flex flex-col gap-0.5">
        {options.map((option) => {
          const isActive = option.value === value

          return (
            <button
              key={option.value}
              className={cn(
                galleryEditorOptionClassName,
                isActive && "bg-accent text-accent-foreground"
              )}
              onClick={() => onValueChange(option.value)}
              type="button"
            >
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {isActive ? <CheckIcon className="size-4 shrink-0" /> : null}
            </button>
          )
        })}
      </div>
    </GallerySidebarPopoverItem>
  )
}

function GalleryThemeRangeItem({
  label,
  max,
  min,
  onValueChange,
  step,
  unit,
  value,
}: {
  label: string
  max: number
  min: number
  onValueChange: (value: string) => void
  step: number
  unit: string
  value: string
}) {
  const numericValue = parseAppThemeCssNumber(value, min)

  return (
    <GallerySidebarPopoverItem
      label={label}
      popoverClassName="w-60 p-3"
      valueLabel={value}
    >
      <div className="flex flex-col gap-3">
        <input
          className="w-full accent-primary"
          max={max}
          min={min}
          onChange={(event) =>
            onValueChange(
              formatAppThemeCssNumber(event.currentTarget.valueAsNumber, unit)
            )
          }
          step={step}
          type="range"
          value={numericValue}
        />
        <div className="flex items-center gap-2">
          <input
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            max={max}
            min={min}
            onChange={(event) => {
              const nextValue = Number.parseFloat(event.currentTarget.value)
              if (Number.isFinite(nextValue)) {
                onValueChange(formatAppThemeCssNumber(nextValue, unit))
              }
            }}
            step={step}
            type="number"
            value={numericValue}
          />
          <span className="w-9 shrink-0 text-xs text-muted-foreground">
            {unit || "value"}
          </span>
        </div>
      </div>
    </GallerySidebarPopoverItem>
  )
}

function GalleryThemeColorValueItem({
  label,
  onValueChange,
  value,
}: {
  label: string
  onValueChange: (value: string) => void
  value: string
}) {
  const colorInputValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"

  return (
    <GallerySidebarPopoverItem
      label={label}
      popoverClassName="w-60 p-3"
      trailing={<ColorSwatch className="size-3" color={colorInputValue} />}
      valueLabel={value}
    >
      <div className="flex flex-col gap-3">
        <input
          className="h-9 w-full cursor-pointer rounded-md border border-input bg-transparent p-1"
          onChange={(event) => onValueChange(event.currentTarget.value)}
          type="color"
          value={colorInputValue}
        />
        <input
          className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          onChange={(event) => onValueChange(event.currentTarget.value)}
          value={value}
        />
      </div>
    </GallerySidebarPopoverItem>
  )
}

function GalleryTypographyEditor({
  cssVariables,
  onCssVariableChange,
}: {
  cssVariables: AppThemeCssVariables
  onCssVariableChange: (
    name: AppThemeEditableVariableName,
    value: string
  ) => void
}) {
  return (
    <GallerySidebarSection label="Typography">
      <SidebarMenu className="gap-0.5">
        <GalleryThemeSelectItem
          label="Sans"
          onValueChange={(value) => onCssVariableChange("--font-sans", value)}
          options={appThemeFontOptions}
          value={getAppThemeCssVariableValue(cssVariables, "--font-sans")}
        />
        <GalleryThemeSelectItem
          label="Serif"
          onValueChange={(value) => onCssVariableChange("--font-serif", value)}
          options={appThemeFontOptions}
          value={getAppThemeCssVariableValue(cssVariables, "--font-serif")}
        />
        <GalleryThemeSelectItem
          label="Mono"
          onValueChange={(value) => onCssVariableChange("--font-mono", value)}
          options={appThemeFontOptions}
          value={getAppThemeCssVariableValue(cssVariables, "--font-mono")}
        />
        <GalleryThemeRangeItem
          label="Tracking"
          max={0.08}
          min={-0.05}
          onValueChange={(value) =>
            onCssVariableChange("--tracking-normal", value)
          }
          step={0.005}
          unit="em"
          value={getAppThemeCssVariableValue(cssVariables, "--tracking-normal")}
        />
      </SidebarMenu>
    </GallerySidebarSection>
  )
}

function GalleryRadiusEditor({
  cssVariables,
  onCssVariableChange,
}: {
  cssVariables: AppThemeCssVariables
  onCssVariableChange: (
    name: AppThemeEditableVariableName,
    value: string
  ) => void
}) {
  return (
    <GallerySidebarSection label="Radius">
      <SidebarMenu className="gap-0.5">
        <GalleryThemeRangeItem
          label="Base radius"
          max={2}
          min={0}
          onValueChange={(value) => onCssVariableChange("--radius", value)}
          step={0.025}
          unit="rem"
          value={getAppThemeCssVariableValue(cssVariables, "--radius")}
        />
      </SidebarMenu>
    </GallerySidebarSection>
  )
}

function GallerySpacingEditor({
  cssVariables,
  onCssVariableChange,
}: {
  cssVariables: AppThemeCssVariables
  onCssVariableChange: (
    name: AppThemeEditableVariableName,
    value: string
  ) => void
}) {
  return (
    <GallerySidebarSection label="Spacing">
      <SidebarMenu className="gap-0.5">
        <GalleryThemeRangeItem
          label="Base spacing"
          max={0.5}
          min={0.125}
          onValueChange={(value) => onCssVariableChange("--spacing", value)}
          step={0.025}
          unit="rem"
          value={getAppThemeCssVariableValue(cssVariables, "--spacing")}
        />
      </SidebarMenu>
    </GallerySidebarSection>
  )
}

function GalleryShadowEditor({
  cssVariables,
  onCssVariablesChange,
}: {
  cssVariables: AppThemeCssVariables
  onCssVariablesChange: (
    values: Partial<Record<AppThemeEditableVariableName, string>>
  ) => void
}) {
  const updateShadowVariable = (
    name: AppThemeEditableVariableName,
    value: string
  ) => {
    onCssVariablesChange(
      createAppThemeShadowScaleVariables(cssVariables, { [name]: value })
    )
  }

  return (
    <GallerySidebarSection label="Shadow">
      <SidebarMenu className="gap-0.5">
        <GalleryThemeColorValueItem
          label="Color"
          onValueChange={(value) => updateShadowVariable("--shadow-color", value)}
          value={getAppThemeCssVariableValue(cssVariables, "--shadow-color")}
        />
        <GalleryThemeRangeItem
          label="Opacity"
          max={1}
          min={0}
          onValueChange={(value) =>
            updateShadowVariable("--shadow-opacity", value)
          }
          step={0.01}
          unit=""
          value={getAppThemeCssVariableValue(cssVariables, "--shadow-opacity")}
        />
        <GalleryThemeRangeItem
          label="X"
          max={24}
          min={-24}
          onValueChange={(value) => updateShadowVariable("--shadow-x", value)}
          step={1}
          unit="px"
          value={getAppThemeCssVariableValue(cssVariables, "--shadow-x")}
        />
        <GalleryThemeRangeItem
          label="Y"
          max={32}
          min={-24}
          onValueChange={(value) => updateShadowVariable("--shadow-y", value)}
          step={1}
          unit="px"
          value={getAppThemeCssVariableValue(cssVariables, "--shadow-y")}
        />
        <GalleryThemeRangeItem
          label="Blur"
          max={64}
          min={0}
          onValueChange={(value) => updateShadowVariable("--shadow-blur", value)}
          step={1}
          unit="px"
          value={getAppThemeCssVariableValue(cssVariables, "--shadow-blur")}
        />
        <GalleryThemeRangeItem
          label="Spread"
          max={24}
          min={-24}
          onValueChange={(value) =>
            updateShadowVariable("--shadow-spread", value)
          }
          step={1}
          unit="px"
          value={getAppThemeCssVariableValue(cssVariables, "--shadow-spread")}
        />
      </SidebarMenu>
    </GallerySidebarSection>
  )
}

export function GalleryEditorPanel({
  colorTokenValues,
  cssVariables,
  onColorTokenValueChange,
  onCssVariableChange,
  onCssVariablesChange,
  sectionId,
}: {
  colorTokenValues: AppColorTokenValues
  cssVariables: AppThemeCssVariables
  onColorTokenValueChange: (
    token: AppColorTokenName,
    value: AppColorTokenValue
  ) => void
  onCssVariableChange: (
    name: AppThemeEditableVariableName,
    value: string
  ) => void
  onCssVariablesChange: (
    values: Partial<Record<AppThemeEditableVariableName, string>>
  ) => void
  sectionId: GalleryThemeEditorSectionId
}) {
  if (sectionId === "typography") {
    return (
      <div className="flex flex-1 flex-col gap-3 px-2 py-2">
        <GalleryTypographyEditor
          cssVariables={cssVariables}
          onCssVariableChange={onCssVariableChange}
        />
      </div>
    )
  }

  if (sectionId === "radius") {
    return (
      <div className="flex flex-1 flex-col gap-3 px-2 py-2">
        <GalleryRadiusEditor
          cssVariables={cssVariables}
          onCssVariableChange={onCssVariableChange}
        />
      </div>
    )
  }

  if (sectionId === "spacing") {
    return (
      <div className="flex flex-1 flex-col gap-3 px-2 py-2">
        <GallerySpacingEditor
          cssVariables={cssVariables}
          onCssVariableChange={onCssVariableChange}
        />
      </div>
    )
  }

  if (sectionId === "shadow") {
    return (
      <div className="flex flex-1 flex-col gap-3 px-2 py-2">
        <GalleryShadowEditor
          cssVariables={cssVariables}
          onCssVariablesChange={onCssVariablesChange}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 px-2 py-2">
      {appColorRoleGroups.map((group, index) => (
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
