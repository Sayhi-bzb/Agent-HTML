import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import {
  canvasThemeEditorSections,
  type CanvasThemeEditorSectionId,
} from "./theme-editor-sections"
import {
  findNearestTailwindColor,
  formatCanvasThemeCssNumber,
  getCanvasThemeCssVariableValue,
  getTailwindColorValue,
  parseCanvasThemeCssNumber,
  tailwindColorFamilies,
  tailwindColorSteps,
  type CanvasThemeDraft,
  type CanvasThemeResolvedVariables,
  type CanvasThemeVariableName,
  type TailwindColorTokenValue,
} from "./theme-draft"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#agent-html-playground/components/ui/collapsible"
import { Input } from "#agent-html-playground/components/ui/input"
import {
  Popover,
  PopoverTrigger,
} from "#agent-html-playground/components/ui/popover"
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import type { HostMessageKey } from "../i18n/messages"
import { useHostI18n } from "../i18n/host-i18n"
import { HostPopoverAction, HostPopoverContent } from "../ui/popover"
import { HostSelect, type HostSelectOption } from "../ui/select"
import { HostItemContent } from "../ui/item-content"
import { HostButton } from "../ui/button"
import { hostSwatchFallbackColor, HostSwatch } from "../ui/swatch"

type ColorTokenItem = {
  labelKey: HostMessageKey
  name: CanvasThemeVariableName
}

type ColorTokenGroup = {
  id: string
  labelKey: HostMessageKey
  items: readonly ColorTokenItem[]
}

type NumericTokenItem = {
  labelKey: HostMessageKey
  max: number
  min: number
  name: CanvasThemeVariableName
  step: number
  unit: string
}

type TailwindColorPanel = "family" | "step"
type HostThemeTranslator = ReturnType<typeof useHostI18n>["t"]
type ThemeSelectOptionDefinition =
  | { label: string; value: string }
  | { labelKey: HostMessageKey; value: string }

const colorTokenGroups: readonly ColorTokenGroup[] = [
  {
    id: "base",
    labelKey: "theme.base",
    items: [
      { labelKey: "theme.background", name: "--background" },
      { labelKey: "theme.foreground", name: "--foreground" },
      { labelKey: "theme.border", name: "--border" },
      { labelKey: "theme.input", name: "--input" },
      { labelKey: "theme.ring", name: "--ring" },
    ],
  },
  {
    id: "surfaces",
    labelKey: "theme.surfaces",
    items: [
      { labelKey: "theme.card", name: "--card" },
      { labelKey: "theme.cardForeground", name: "--card-foreground" },
      { labelKey: "theme.popover", name: "--popover" },
      { labelKey: "theme.popoverForeground", name: "--popover-foreground" },
    ],
  },
  {
    id: "actions",
    labelKey: "theme.actions",
    items: [
      { labelKey: "theme.primary", name: "--primary" },
      { labelKey: "theme.primaryForeground", name: "--primary-foreground" },
      { labelKey: "theme.secondary", name: "--secondary" },
      { labelKey: "theme.secondaryForeground", name: "--secondary-foreground" },
    ],
  },
  {
    id: "state",
    labelKey: "theme.state",
    items: [
      { labelKey: "theme.success", name: "--success" },
      { labelKey: "theme.successForeground", name: "--success-foreground" },
      { labelKey: "theme.warning", name: "--warning" },
      { labelKey: "theme.warningForeground", name: "--warning-foreground" },
      { labelKey: "theme.info", name: "--info" },
      { labelKey: "theme.infoForeground", name: "--info-foreground" },
      { labelKey: "theme.destructive", name: "--destructive" },
    ],
  },
  {
    id: "support",
    labelKey: "theme.support",
    items: [
      { labelKey: "theme.muted", name: "--muted" },
      { labelKey: "theme.mutedForeground", name: "--muted-foreground" },
      { labelKey: "theme.accent", name: "--accent" },
      { labelKey: "theme.accentForeground", name: "--accent-foreground" },
    ],
  },
  {
    id: "charts",
    labelKey: "theme.charts",
    items: [
      { labelKey: "theme.chart1", name: "--chart-1" },
      { labelKey: "theme.chart2", name: "--chart-2" },
      { labelKey: "theme.chart3", name: "--chart-3" },
      { labelKey: "theme.chart4", name: "--chart-4" },
      { labelKey: "theme.chart5", name: "--chart-5" },
    ],
  },
]

const fontOptions = [
  {
    label: "Geist",
    value: "'Geist Variable', sans-serif",
  },
  {
    labelKey: "theme.system",
    value:
      "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  {
    labelKey: "theme.serif",
    value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  },
  {
    labelKey: "theme.mono",
    value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
] as const satisfies readonly ThemeSelectOptionDefinition[]

function translateThemeOptions(
  options: readonly ThemeSelectOptionDefinition[],
  t: HostThemeTranslator
) {
  return options.map((option) => ({
    label: "labelKey" in option ? t(option.labelKey) : option.label,
    value: option.value,
  }))
}

const radiusTokens: readonly NumericTokenItem[] = [
  {
    labelKey: "theme.radius",
    max: 2,
    min: 0,
    name: "--radius",
    step: 0.025,
    unit: "rem",
  },
]

const spacingTokens: readonly NumericTokenItem[] = [
  {
    labelKey: "theme.baseSpacing",
    max: 0.75,
    min: 0.125,
    name: "--spacing",
    step: 0.025,
    unit: "rem",
  },
]

const typographyRangeTokens: readonly NumericTokenItem[] = [
  {
    labelKey: "theme.tracking",
    max: 0.08,
    min: -0.05,
    name: "--tracking-normal",
    step: 0.005,
    unit: "em",
  },
]

const canvasRangeTokens: readonly NumericTokenItem[] = [
  {
    labelKey: "theme.artifactWidth",
    max: 80,
    min: 30,
    name: "--canvas-artifact-max-width",
    step: 1,
    unit: "rem",
  },
  {
    labelKey: "theme.blockGap",
    max: 4,
    min: 0.5,
    name: "--canvas-artifact-block-gap",
    step: 0.125,
    unit: "rem",
  },
]

const editorPopoverButtonClassName = "canvas-theme-editor-popover-button"

const editorSectionTriggerClassName = "canvas-theme-editor-section-trigger"

function getThemePresetSwatchColor(preset: CanvasThemePreset) {
  return (
    preset.lightCssVariables["--primary"] ??
    preset.lightCssVariables["--ring"] ??
    hostSwatchFallbackColor
  )
}

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
      <section className="canvas-theme-editor-section">
        <div className="canvas-theme-editor-section-label">{label}</div>
        <div className="canvas-theme-editor-section-content">{children}</div>
      </section>
    )
  }

  return (
    <Collapsible className="group/collapsible" defaultOpen={defaultOpen}>
      <section className="canvas-theme-editor-section">
        <CollapsibleTrigger asChild>
          <HostButton
            className={editorSectionTriggerClassName}
            size="sm"
            type="button"
            variant="ghost"
          >
            {label}
            <ChevronRightIcon className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
          </HostButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="canvas-theme-editor-section-content">{children}</div>
        </CollapsibleContent>
      </section>
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
    <div className="canvas-theme-editor-item">
      <Popover>
        <PopoverTrigger asChild>
          <HostButton
            className={editorPopoverButtonClassName}
            size="default"
            type="button"
            variant="ghost"
          >
            <HostItemContent
              caption={valueLabel}
              label={label}
              layout="inline"
              trailing={trailing}
            />
          </HostButton>
        </PopoverTrigger>
        <HostPopoverContent
          align="start"
          className={popoverClassName}
          side="right"
          sideOffset={10}
        >
          {children}
        </HostPopoverContent>
      </Popover>
    </div>
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
        {options.map((option) => (
          <HostPopoverAction
            active={option.value === value}
            key={option.value}
            label={option.label}
            onClick={() => onValueChange(option.value)}
          />
        ))}
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
    <HostPopoverAction
      activeSemantics="pressed"
      className="canvas-theme-editor-picker-tab"
      data-active={isActive}
      active={isActive}
      label={label}
      onClick={onActivate}
      swatchColor={getOptionColor(value)}
    />
  )
}

function TailwindColorEditor({
  token,
  onValueChange,
}: {
  onValueChange: (value: TailwindColorTokenValue) => void
  token: TailwindColorTokenValue
}) {
  const { t } = useHostI18n()
  const [activePanel, setActivePanel] =
    React.useState<TailwindColorPanel>("family")

  return (
    <div className="canvas-theme-editor-color-picker">
      <div className="canvas-theme-editor-picker-preview">
        <HostSwatch color={getTailwindColorValue(token)} size="sm" />
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
          label={t("theme.family")}
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
          label={t("theme.step")}
          onActivate={() => setActivePanel("step")}
          value={token.step}
        />
      </div>
      <div className="canvas-theme-editor-popover-menu">
        {activePanel === "family"
          ? tailwindColorFamilies.map((family) => {
              const isActive = family === token.family

              return (
                <HostPopoverAction
                  active={isActive}
                  key={family}
                  label={family}
                  onClick={() => onValueChange({ ...token, family })}
                  swatchColor={getTailwindColorValue({
                    family,
                    step: token.step,
                  })}
                />
              )
            })
          : tailwindColorSteps.map((step) => {
              const isActive = step === token.step

              return (
                <HostPopoverAction
                  active={isActive}
                  key={step}
                  label={step}
                  onClick={() => onValueChange({ ...token, step })}
                  swatchColor={getTailwindColorValue({
                    family: token.family,
                    step,
                  })}
                />
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
  const { t } = useHostI18n()
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
      label={t(item.labelKey)}
      popoverClassName="canvas-theme-editor-popover-md"
      trailing={<HostSwatch color={swatchColor} size="sm" />}
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
  const { t } = useHostI18n()
  const value = getVariableValue({
    draft,
    name: item.name,
    preset,
    runtimeVariables,
  })
  const numericValue = parseCanvasThemeCssNumber(value, item.min)

  return (
    <EditorPopoverItem label={t(item.labelKey)} valueLabel={value}>
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
            {item.unit || t("theme.value")}
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
  const { t } = useHostI18n()

  return (
    <div className="canvas-theme-editor-section-stack">
      {colorTokenGroups.map((group, index) => (
        <EditorSection
          collapsible
          defaultOpen={index === 0}
          key={group.id}
          label={t(group.labelKey)}
        >
          <div className="canvas-theme-editor-menu">
            {group.items.map((item) => (
              <ColorTokenRow key={item.name} item={item} {...props} />
            ))}
          </div>
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
  const { t } = useHostI18n()
  const translatedFontOptions = React.useMemo(
    () => translateThemeOptions(fontOptions, t),
    [t]
  )

  return (
    <div className="canvas-theme-editor-section-stack">
      <EditorSection label={t("theme.typography")}>
        <div className="canvas-theme-editor-menu">
          <ThemeSelectItem
            label={t("theme.sans")}
            onValueChange={(value) =>
              props.onVariableChange("--font-sans", value)
            }
            options={translatedFontOptions}
            value={getVariableValue({
              draft: props.draft,
              name: "--font-sans",
              preset: props.preset,
              runtimeVariables: props.runtimeVariables,
            })}
          />
          <ThemeSelectItem
            label={t("theme.heading")}
            onValueChange={(value) =>
              props.onVariableChange("--font-heading", value)
            }
            options={translatedFontOptions}
            value={getVariableValue({
              draft: props.draft,
              name: "--font-heading",
              preset: props.preset,
              runtimeVariables: props.runtimeVariables,
            })}
          />
          <ThemeSelectItem
            label={t("theme.mono")}
            onValueChange={(value) =>
              props.onVariableChange("--font-mono", value)
            }
            options={translatedFontOptions}
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
        </div>
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
        <div className="canvas-theme-editor-menu">
          {items.map((item) => (
            <RangeTokenRow key={item.name} item={item} {...props} />
          ))}
        </div>
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
  const { t } = useHostI18n()

  return (
    <div className="canvas-theme-editor-section-stack">
      <EditorSection label={t("theme.readingLayout")}>
        <div className="canvas-theme-editor-menu">
          {canvasRangeTokens.map((item) => (
            <RangeTokenRow key={item.name} item={item} {...props} />
          ))}
        </div>
      </EditorSection>
    </div>
  )
}

export function ReactCanvasThemePresetSelect({
  activePresetId,
  onSelectPreset,
  presets,
}: {
  activePresetId: CanvasThemePresetId
  onSelectPreset: (presetId: CanvasThemePresetId) => void
  presets: readonly CanvasThemePreset[]
}) {
  const { t } = useHostI18n()

  return (
    <HostSelect
      label={t("theme.themePreset")}
      layout="floating"
      onValueChange={(value) => onSelectPreset(value as CanvasThemePresetId)}
      options={presets.map((preset) => ({
        label: preset.label,
        swatchColor: getThemePresetSwatchColor(preset),
        value: preset.id,
      }))}
      value={activePresetId}
    />
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
  const { t } = useHostI18n()

  return (
    <div className="canvas-theme-editor-header-stack">
      <ReactCanvasThemePresetSelect
        activePresetId={activePresetId}
        onSelectPreset={onSelectPreset}
        presets={presets}
      />
      <HostSelect
        label={t("theme.themeSection")}
        layout="floating"
        onValueChange={(value) =>
          onSelectSection(value as CanvasThemeEditorSectionId)
        }
        options={canvasThemeEditorSections.map(
          (section) =>
            ({
              icon: section.icon,
              label: t(section.labelKey),
              value: section.id,
            }) satisfies HostSelectOption
        )}
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
  const { t } = useHostI18n()
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
    return (
      <NumericSection
        items={radiusTokens}
        label={t("theme.radius")}
        {...props}
      />
    )
  }

  if (activeSectionId === "spacing") {
    return (
      <NumericSection
        items={spacingTokens}
        label={t("theme.spacing")}
        {...props}
      />
    )
  }

  if (activeSectionId === "canvas") {
    return <CanvasSection {...props} />
  }

  return <ColorSection {...props} />
}
