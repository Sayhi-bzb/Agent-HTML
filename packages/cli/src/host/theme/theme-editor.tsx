import * as React from "react"
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react"

import {
  canvasThemeEditorSections,
  type CanvasThemeEditorSectionId,
} from "./theme-editor-sections"
import {
  findNearestTailwindColor,
  formatCanvasThemeCssNumber,
  getCanvasThemeCssVariableValue,
  getTailwindColorValue,
  isCssColorPreviewable,
  parseCanvasThemeCssNumber,
  tailwindColorFamilies,
  tailwindColorSteps,
  type CanvasThemeDraft,
  type CanvasThemeResolvedVariables,
  type CanvasThemeVariableName,
  type TailwindColorTokenValue,
} from "./theme-draft"
import { Button } from "#agent-html-playground/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "#agent-html-playground/components/ui/collapsible"
import { Input } from "#agent-html-playground/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "#agent-html-playground/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#agent-html-playground/components/ui/select"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#agent-html-playground/components/ui/sidebar"
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"

type ColorTokenItem = {
  label: string
  name: CanvasThemeVariableName
}

type ColorTokenGroup = {
  id: string
  label: string
  items: readonly ColorTokenItem[]
}

type NumericTokenItem = {
  label: string
  max: number
  min: number
  name: CanvasThemeVariableName
  step: number
  unit: string
}

type TailwindColorPanel = "family" | "step"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

const colorTokenGroups: readonly ColorTokenGroup[] = [
  {
    id: "base",
    label: "Base",
    items: [
      { label: "background", name: "--background" },
      { label: "foreground", name: "--foreground" },
      { label: "border", name: "--border" },
      { label: "input", name: "--input" },
      { label: "ring", name: "--ring" },
    ],
  },
  {
    id: "surfaces",
    label: "Surfaces",
    items: [
      { label: "card", name: "--card" },
      { label: "card foreground", name: "--card-foreground" },
      { label: "popover", name: "--popover" },
      { label: "popover foreground", name: "--popover-foreground" },
    ],
  },
  {
    id: "actions",
    label: "Actions",
    items: [
      { label: "primary", name: "--primary" },
      { label: "primary foreground", name: "--primary-foreground" },
      { label: "secondary", name: "--secondary" },
      { label: "secondary foreground", name: "--secondary-foreground" },
      { label: "destructive", name: "--destructive" },
    ],
  },
  {
    id: "support",
    label: "Support",
    items: [
      { label: "muted", name: "--muted" },
      { label: "muted foreground", name: "--muted-foreground" },
      { label: "accent", name: "--accent" },
      { label: "accent foreground", name: "--accent-foreground" },
    ],
  },
  {
    id: "charts",
    label: "Charts",
    items: [
      { label: "chart 1", name: "--chart-1" },
      { label: "chart 2", name: "--chart-2" },
      { label: "chart 3", name: "--chart-3" },
      { label: "chart 4", name: "--chart-4" },
      { label: "chart 5", name: "--chart-5" },
    ],
  },
]

const fontOptions = [
  {
    label: "Geist",
    value: "'Geist Variable', sans-serif",
  },
  {
    label: "System",
    value: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    label: "Serif",
    value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  {
    label: "Mono",
    value:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
] as const

const radiusTokens: readonly NumericTokenItem[] = [
  {
    label: "Radius",
    max: 2,
    min: 0,
    name: "--radius",
    step: 0.025,
    unit: "rem",
  },
]

const spacingTokens: readonly NumericTokenItem[] = [
  {
    label: "Base spacing",
    max: 0.75,
    min: 0.125,
    name: "--spacing",
    step: 0.025,
    unit: "rem",
  },
]

const typographyRangeTokens: readonly NumericTokenItem[] = [
  {
    label: "Tracking",
    max: 0.08,
    min: -0.05,
    name: "--tracking-normal",
    step: 0.005,
    unit: "em",
  },
]

const canvasRangeTokens: readonly NumericTokenItem[] = [
  {
    label: "Artifact width",
    max: 80,
    min: 30,
    name: "--canvas-artifact-max-width",
    step: 1,
    unit: "rem",
  },
  {
    label: "Block gap",
    max: 4,
    min: 0.5,
    name: "--canvas-artifact-block-gap",
    step: 0.125,
    unit: "rem",
  },
]

const editorPopoverButtonClassName =
  "canvas-theme-editor-popover-button"

const editorSectionTriggerClassName =
  "group/label canvas-sidebar-body text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

const editorOptionClassName =
  "canvas-theme-editor-option"

function getVariableValue({
  draft,
  name,
  preset,
  runtimeVariables,
}: {
  draft: CanvasThemeDraft
  name: CanvasThemeVariableName
  preset: CanvasThemePreset
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  return getCanvasThemeCssVariableValue({
    draft,
    name,
    preset,
    runtimeVariables,
  })
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
      style={{ backgroundColor: isCssColorPreviewable(color) ? color : "" }}
    />
  )
}

function EditorSection({
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
      <SidebarGroup className="canvas-theme-editor-section">
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>{children}</SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <Collapsible className="group/collapsible" defaultOpen={defaultOpen}>
      <SidebarGroup className="canvas-theme-editor-section">
        <SidebarGroupLabel
          asChild
          className={editorSectionTriggerClassName}
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

function EditorPopoverItem({
  children,
  label,
  popoverClassName = "canvas-theme-editor-popover-lg",
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
            className={editorPopoverButtonClassName}
            size="sm"
            type="button"
          >
            <span className="canvas-theme-editor-value-stack">
              <span className="truncate">{label}</span>
              <span className="canvas-theme-editor-caption truncate">
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

function SelectHeaderItem({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string
  onValueChange: (value: string) => void
  options: readonly { icon?: React.ComponentType<{ className?: string }>; label: string; value: string }[]
  value: string
}) {
  const activeOption = options.find((option) => option.value === value)
  const ActiveIcon = activeOption?.icon

  return (
    <Select onValueChange={onValueChange} value={value}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SelectTrigger asChild>
            <SidebarMenuButton
              aria-label={label}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              type="button"
            >
              <SelectValue placeholder={label}>
                <span className="canvas-theme-editor-inline-value text-left">
                  {ActiveIcon ? <ActiveIcon className="canvas-theme-editor-icon" /> : null}
                  <span className="truncate">{activeOption?.label ?? label}</span>
                </span>
              </SelectValue>
              <ChevronDownIcon className="canvas-theme-editor-icon ml-auto text-sidebar-foreground/60" />
            </SidebarMenuButton>
          </SelectTrigger>
        </SidebarMenuItem>
      </SidebarMenu>
      <SelectContent
        align="start"
        className="canvas-sidebar-select-content"
        position="popper"
      >
        {options.map((option) => {
          const Icon = option.icon

          return (
            <SelectItem
              className="canvas-sidebar-select-item"
              key={option.value}
              value={option.value}
            >
              {Icon ? <Icon className="canvas-theme-editor-icon" /> : null}
              <span className="min-w-0 truncate">{option.label}</span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

function ThemeSelectItem({
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
    <EditorPopoverItem
      label={label}
      popoverClassName="canvas-theme-editor-popover-lg-compact"
      valueLabel={activeOption?.label ?? value}
    >
      <div className="canvas-theme-editor-popover-stack">
        {options.map((option) => {
          const isActive = option.value === value

          return (
            <Button
              className={cn(
                editorOptionClassName,
                "justify-start",
                isActive && "bg-accent text-accent-foreground"
              )}
              key={option.value}
              onClick={() => onValueChange(option.value)}
              type="button"
              variant="ghost"
            >
              <span className="min-w-0 flex-1 truncate text-left">
                {option.label}
              </span>
              {isActive ? <CheckIcon className="canvas-theme-editor-icon" /> : null}
            </Button>
          )
        })}
      </div>
    </EditorPopoverItem>
  )
}

function ColorOptionField<Option extends string>({
  getOptionColor,
  isActive,
  label,
  onActivate,
  value,
}: {
  getOptionColor: (option: Option) => string
  isActive: boolean
  label: string
  onActivate: () => void
  value: Option
}) {
  return (
    <Button
      aria-expanded={isActive}
      className="canvas-theme-editor-picker-tab"
      data-active={isActive}
      onClick={onActivate}
      type="button"
      variant="ghost"
    >
      <span className="canvas-theme-editor-inline-value justify-center">
        <ColorSwatch className="canvas-theme-editor-swatch-xs" color={getOptionColor(value)} />
        <span className="truncate">{label}</span>
      </span>
    </Button>
  )
}

function TailwindColorEditor({
  token,
  onValueChange,
}: {
  onValueChange: (value: TailwindColorTokenValue) => void
  token: TailwindColorTokenValue
}) {
  const [activePanel, setActivePanel] =
    React.useState<TailwindColorPanel>("family")

  return (
    <div className="canvas-theme-editor-color-picker">
      <div className="canvas-theme-editor-picker-preview">
        <ColorSwatch
          className="canvas-theme-editor-swatch-sm"
          color={getTailwindColorValue(token)}
        />
        <span className="min-w-0 flex-1 truncate">
          {token.family} / {token.step}
        </span>
      </div>
      <div className="canvas-theme-editor-picker-tabs">
        <ColorOptionField
          getOptionColor={(family) =>
            getTailwindColorValue({
              family,
              step: token.step,
            })
          }
          isActive={activePanel === "family"}
          label="Family"
          onActivate={() => setActivePanel("family")}
          value={token.family}
        />
        <ColorOptionField
          getOptionColor={(step) =>
            getTailwindColorValue({
              family: token.family,
              step,
            })
          }
          isActive={activePanel === "step"}
          label="Step"
          onActivate={() => setActivePanel("step")}
          value={token.step}
        />
      </div>
      <div className="canvas-theme-editor-popover-menu">
        {activePanel === "family"
          ? tailwindColorFamilies.map((family) => {
              const isActive = family === token.family

              return (
                <Button
                  className={cn(
                    editorOptionClassName,
                    "justify-start",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                  key={family}
                  onClick={() => onValueChange({ ...token, family })}
                  type="button"
                  variant="ghost"
                >
                  <ColorSwatch
                    className="canvas-theme-editor-swatch-xs"
                    color={getTailwindColorValue({
                      family,
                      step: token.step,
                    })}
                  />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {family}
                  </span>
                  {isActive ? <CheckIcon className="canvas-theme-editor-icon" /> : null}
                </Button>
              )
            })
          : tailwindColorSteps.map((step) => {
              const isActive = step === token.step

              return (
                <Button
                  className={cn(
                    editorOptionClassName,
                    "justify-start",
                    isActive && "bg-accent text-accent-foreground"
                  )}
                  key={step}
                  onClick={() => onValueChange({ ...token, step })}
                  type="button"
                  variant="ghost"
                >
                  <ColorSwatch
                    className="canvas-theme-editor-swatch-xs"
                    color={getTailwindColorValue({
                      family: token.family,
                      step,
                    })}
                  />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {step}
                  </span>
                  {isActive ? <CheckIcon className="canvas-theme-editor-icon" /> : null}
                </Button>
              )
            })}
      </div>
    </div>
  )
}

function ColorTokenRow({
  draft,
  item,
  onVariableChange,
  preset,
  runtimeVariables,
}: {
  draft: CanvasThemeDraft
  item: ColorTokenItem
  onVariableChange: (name: CanvasThemeVariableName, value: string) => void
  preset: CanvasThemePreset
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  const value = getVariableValue({
    draft,
    name: item.name,
    preset,
    runtimeVariables,
  })
  const tailwindToken = findNearestTailwindColor(value)
  const swatchColor = tailwindToken
    ? getTailwindColorValue(tailwindToken)
    : value
  const valueLabel = tailwindToken
    ? `${tailwindToken.family} / ${tailwindToken.step}`
    : value
  const colorInputValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"

  return (
    <EditorPopoverItem
      label={item.label}
      popoverClassName="canvas-theme-editor-popover-md"
      trailing={<ColorSwatch className="canvas-theme-editor-swatch-sm" color={swatchColor} />}
      valueLabel={valueLabel}
    >
      {tailwindToken ? (
        <TailwindColorEditor
          onValueChange={(nextToken) =>
            onVariableChange(item.name, getTailwindColorValue(nextToken))
          }
          token={tailwindToken}
        />
      ) : (
        <div className="canvas-theme-editor-field-stack">
          <Input
            className="canvas-theme-editor-color-input"
            onChange={(event) =>
              onVariableChange(item.name, event.currentTarget.value)
            }
            type="color"
            value={colorInputValue}
          />
          <Input
            onChange={(event) =>
              onVariableChange(item.name, event.currentTarget.value)
            }
            value={value}
          />
        </div>
      )}
    </EditorPopoverItem>
  )
}

function RangeTokenRow({
  draft,
  item,
  onVariableChange,
  preset,
  runtimeVariables,
}: {
  draft: CanvasThemeDraft
  item: NumericTokenItem
  onVariableChange: (name: CanvasThemeVariableName, value: string) => void
  preset: CanvasThemePreset
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  const value = getVariableValue({
    draft,
    name: item.name,
    preset,
    runtimeVariables,
  })
  const numericValue = parseCanvasThemeCssNumber(value, item.min)

  return (
    <EditorPopoverItem label={item.label} valueLabel={value}>
      <div className="canvas-theme-editor-field-stack">
        <Input
          className="canvas-theme-editor-range-input"
          max={item.max}
          min={item.min}
          onChange={(event) =>
            onVariableChange(
              item.name,
              formatCanvasThemeCssNumber(
                event.currentTarget.valueAsNumber,
                item.unit
              )
            )
          }
          step={item.step}
          type="range"
          value={numericValue}
        />
        <div className="canvas-theme-editor-number-row">
          <Input
            max={item.max}
            min={item.min}
            onChange={(event) => {
              const nextValue = Number.parseFloat(event.currentTarget.value)
              if (Number.isFinite(nextValue)) {
                onVariableChange(
                  item.name,
                  formatCanvasThemeCssNumber(nextValue, item.unit)
                )
              }
            }}
            step={item.step}
            type="number"
            value={numericValue}
          />
          <span className="canvas-theme-editor-unit">
            {item.unit || "value"}
          </span>
        </div>
      </div>
    </EditorPopoverItem>
  )
}

function ColorSection(props: {
  draft: CanvasThemeDraft
  onVariableChange: (name: CanvasThemeVariableName, value: string) => void
  preset: CanvasThemePreset
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  return (
    <div className="canvas-theme-editor-section-stack">
      {colorTokenGroups.map((group, index) => (
        <EditorSection
          collapsible
          defaultOpen={index === 0}
          key={group.id}
          label={group.label}
        >
          <SidebarMenu className="canvas-theme-editor-menu">
            {group.items.map((item) => (
              <ColorTokenRow key={item.name} item={item} {...props} />
            ))}
          </SidebarMenu>
        </EditorSection>
      ))}
    </div>
  )
}

function TypographySection(props: {
  draft: CanvasThemeDraft
  onVariableChange: (name: CanvasThemeVariableName, value: string) => void
  preset: CanvasThemePreset
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  return (
    <div className="canvas-theme-editor-section-stack">
      <EditorSection label="Typography">
        <SidebarMenu className="canvas-theme-editor-menu">
          <ThemeSelectItem
            label="Sans"
            onValueChange={(value) =>
              props.onVariableChange("--font-sans", value)
            }
            options={fontOptions}
            value={getVariableValue({
              draft: props.draft,
              name: "--font-sans",
              preset: props.preset,
              runtimeVariables: props.runtimeVariables,
            })}
          />
          <ThemeSelectItem
            label="Heading"
            onValueChange={(value) =>
              props.onVariableChange("--font-heading", value)
            }
            options={fontOptions}
            value={getVariableValue({
              draft: props.draft,
              name: "--font-heading",
              preset: props.preset,
              runtimeVariables: props.runtimeVariables,
            })}
          />
          <ThemeSelectItem
            label="Mono"
            onValueChange={(value) => props.onVariableChange("--font-mono", value)}
            options={fontOptions}
            value={getVariableValue({
              draft: props.draft,
              name: "--font-mono",
              preset: props.preset,
              runtimeVariables: props.runtimeVariables,
            })}
          />
          {typographyRangeTokens.map((item) => (
            <RangeTokenRow key={item.name} item={item} {...props} />
          ))}
        </SidebarMenu>
      </EditorSection>
    </div>
  )
}

function NumericSection({
  items,
  label,
  ...props
}: {
  draft: CanvasThemeDraft
  items: readonly NumericTokenItem[]
  label: string
  onVariableChange: (name: CanvasThemeVariableName, value: string) => void
  preset: CanvasThemePreset
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  return (
    <div className="canvas-theme-editor-section-stack">
      <EditorSection label={label}>
        <SidebarMenu className="canvas-theme-editor-menu">
          {items.map((item) => (
            <RangeTokenRow key={item.name} item={item} {...props} />
          ))}
        </SidebarMenu>
      </EditorSection>
    </div>
  )
}

function CanvasSection(props: {
  draft: CanvasThemeDraft
  onVariableChange: (name: CanvasThemeVariableName, value: string) => void
  preset: CanvasThemePreset
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  return (
    <div className="canvas-theme-editor-section-stack">
      <EditorSection label="Reading layout">
        <SidebarMenu className="canvas-theme-editor-menu">
          {canvasRangeTokens.map((item) => (
            <RangeTokenRow key={item.name} item={item} {...props} />
          ))}
        </SidebarMenu>
      </EditorSection>
    </div>
  )
}

export function ReactCanvasThemeEditorHeader({
  activePresetId,
  activeSectionId,
  onSelectPreset,
  onSelectSection,
  presets,
}: {
  activePresetId: CanvasThemePresetId
  activeSectionId: CanvasThemeEditorSectionId
  onSelectPreset: (presetId: CanvasThemePresetId) => void
  onSelectSection: (sectionId: CanvasThemeEditorSectionId) => void
  presets: readonly CanvasThemePreset[]
}) {
  return (
    <div className="canvas-theme-editor-header-stack">
      <SelectHeaderItem
        label="Theme preset"
        onValueChange={(value) => onSelectPreset(value as CanvasThemePresetId)}
        options={presets.map((preset) => ({
          label: preset.label,
          value: preset.id,
        }))}
        value={activePresetId}
      />
      <SelectHeaderItem
        label="Theme section"
        onValueChange={(value) =>
          onSelectSection(value as CanvasThemeEditorSectionId)
        }
        options={canvasThemeEditorSections.map((section) => ({
          icon: section.icon,
          label: section.label,
          value: section.id,
        }))}
        value={activeSectionId}
      />
    </div>
  )
}

export function ReactCanvasThemeEditor({
  activeSectionId,
  draft,
  onVariableChange,
  preset,
  runtimeVariables,
}: {
  activeSectionId: CanvasThemeEditorSectionId
  draft: CanvasThemeDraft
  onVariableChange: (name: CanvasThemeVariableName, value: string) => void
  preset: CanvasThemePreset
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  const props = {
    draft,
    onVariableChange,
    preset,
    runtimeVariables,
  }

  if (activeSectionId === "typography") {
    return <TypographySection {...props} />
  }

  if (activeSectionId === "radius") {
    return <NumericSection items={radiusTokens} label="Radius" {...props} />
  }

  if (activeSectionId === "spacing") {
    return <NumericSection items={spacingTokens} label="Spacing" {...props} />
  }

  if (activeSectionId === "canvas") {
    return <CanvasSection {...props} />
  }

  return <ColorSection {...props} />
}
