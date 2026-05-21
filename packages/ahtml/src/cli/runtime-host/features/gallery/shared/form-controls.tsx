import React from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"

import { extractFontName, formatThemeTokenLabel } from "../helpers"
import type {
  ArtifactProfile,
  FocusedThemeToken,
  FontPickerOption,
  ThemeTokenName,
} from "../types"

function createTokenColorSuggestions(tokenValue: string) {
  const sharedOptions = [
    "#ffffff",
    "#f8fafc",
    "#e2e8f0",
    "#cbd5e1",
    "#94a3b8",
    "#64748b",
    "#334155",
    "#0f172a",
  ]

  const options = tokenValue.startsWith("#")
    ? [tokenValue, ...sharedOptions]
    : sharedOptions

  return Array.from(new Set(options)).slice(0, 8)
}

export function TokenEditor({
  labels,
  focusedToken,
  tokens,
  onChange,
}: {
  labels: Partial<Record<ThemeTokenName, string>>
  focusedToken?: ThemeTokenName | null
  tokens: Partial<ArtifactProfile["globalStyle"]["tokenSets"]["light"]>
  onChange: (tokenName: ThemeTokenName, value: string) => void
}) {
  const rowRefs = React.useRef(new Map<ThemeTokenName, HTMLDivElement>())
  const [openToken, setOpenToken] = React.useState<ThemeTokenName | null>(null)

  React.useEffect(() => {
    if (!focusedToken) {
      return
    }

    rowRefs.current.get(focusedToken)?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [focusedToken])

  return (
    <div className="ahtml-gallery-stack">
      {Object.entries(tokens).map(([tokenName, tokenValue]) => (
        <div
          className={[
            "ahtml-gallery-token-row",
            focusedToken === tokenName ? "is-focused" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          data-focused={focusedToken === tokenName ? "true" : "false"}
          key={tokenName}
          ref={(node) => {
            const typedTokenName = tokenName as ThemeTokenName

            if (node) {
              rowRefs.current.set(typedTokenName, node)
              return
            }

            rowRefs.current.delete(typedTokenName)
          }}
        >
          <div className="ahtml-gallery-token-meta">
            <Popover
              onOpenChange={(open) =>
                setOpenToken(open ? (tokenName as ThemeTokenName) : null)
              }
              open={openToken === tokenName}
            >
              <PopoverTrigger asChild>
                <button
                  className="ahtml-gallery-color-trigger"
                  title={`Open ${tokenName} color controls`}
                  type="button"
                >
                  <span
                    aria-hidden="true"
                    className="ahtml-gallery-swatch"
                    style={{ background: tokenValue }}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="ahtml-gallery-color-popover"
              >
                <PopoverHeader>
                  <PopoverTitle>
                    {labels[tokenName as ThemeTokenName] ??
                      formatThemeTokenLabel(tokenName as ThemeTokenName)}
                  </PopoverTitle>
                  <PopoverDescription>{tokenName}</PopoverDescription>
                </PopoverHeader>
                <div className="ahtml-gallery-color-popover-grid">
                  {createTokenColorSuggestions(tokenValue ?? "").map(
                    (option) => (
                      <button
                        className="ahtml-gallery-color-suggestion"
                        key={option}
                        onClick={() =>
                          onChange(tokenName as ThemeTokenName, option)
                        }
                        title={`Apply ${option}`}
                        type="button"
                      >
                        <span
                          aria-hidden="true"
                          className="ahtml-gallery-color-suggestion-swatch"
                          style={{ background: option }}
                        />
                        <span>{option}</span>
                      </button>
                    ),
                  )}
                </div>
                <div className="ahtml-gallery-color-popover-input-wrap">
                  <Input
                    className="ahtml-gallery-control-input ahtml-gallery-control-input-mono"
                    onChange={(event) =>
                      onChange(tokenName as ThemeTokenName, event.target.value)
                    }
                    value={tokenValue}
                  />
                </div>
              </PopoverContent>
            </Popover>
            <div className="ahtml-gallery-token-copy">
              <strong>
                {labels[tokenName as ThemeTokenName] ??
                  formatThemeTokenLabel(tokenName as ThemeTokenName)}
              </strong>
              <span>{tokenName}</span>
            </div>
          </div>
          <div className="ahtml-gallery-token-input-wrap">
            <Input
              className="ahtml-gallery-control-input-mono ahtml-gallery-token-input"
              onChange={(event) =>
                onChange(tokenName as ThemeTokenName, event.target.value)
              }
              value={tokenValue}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LabeledInput({
  description,
  label,
  mono = false,
  onChange,
  value,
}: {
  description?: string
  label: string
  mono?: boolean
  onChange: (value: string) => void
  value: string
}) {
  const id = React.useId()

  return (
    <Field className="ahtml-gallery-control-row">
      <div className="ahtml-gallery-control-copy">
        <FieldLabel className="ahtml-gallery-control-label" htmlFor={id}>
          {label}
        </FieldLabel>
        {description ? (
          <FieldDescription className="ahtml-gallery-control-description">
            {description}
          </FieldDescription>
        ) : null}
      </div>
      <div className="ahtml-gallery-control-input-wrap">
        <Input
          className={[
            "ahtml-gallery-control-input",
            mono ? "ahtml-gallery-control-input-mono" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          id={id}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      </div>
    </Field>
  )
}

export function FontPickerField({
  description,
  focused = false,
  label,
  onChange,
  options,
  value,
}: {
  description?: string
  focused?: boolean
  label: string
  onChange: (value: string) => void
  options: FontPickerOption[]
  value: string
}) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const filteredOptions = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return options
    }

    return options.filter((option) =>
      [option.label, option.category, option.value]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [options, search])
  const currentOption =
    options.find((option) => option.value === value) ??
    ({
      category: label.includes("Heading") ? "Heading" : "Sans",
      label: extractFontName(value),
      value,
    } as FontPickerOption)

  React.useEffect(() => {
    if (!focused) {
      return
    }

    rootRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [focused])

  return (
    <div
      className={["ahtml-gallery-font-field", focused ? "is-focused" : null]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <Field className="ahtml-gallery-control-row ahtml-gallery-font-picker-row">
        <div className="ahtml-gallery-control-copy">
          <FieldLabel className="ahtml-gallery-control-label">
            {label}
          </FieldLabel>
          {description ? (
            <FieldDescription className="ahtml-gallery-control-description">
              {description}
            </FieldDescription>
          ) : null}
        </div>
        <div className="ahtml-gallery-control-input-wrap">
          <Popover
            onOpenChange={(nextOpen) => {
              setOpen(nextOpen)
              if (!nextOpen) {
                setSearch("")
              }
            }}
            open={open}
          >
            <PopoverTrigger asChild>
              <Button
                className="ahtml-gallery-font-picker-trigger"
                size="sm"
                type="button"
                variant="outline"
              >
                <span className="ahtml-gallery-font-picker-trigger-copy">
                  <strong style={{ fontFamily: value }}>
                    {currentOption.label}
                  </strong>
                  <span>{currentOption.category}</span>
                </span>
                <ChevronDown aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="ahtml-gallery-font-picker-popover"
            >
              <PopoverHeader>
                <PopoverTitle>{label} picker</PopoverTitle>
                <PopoverDescription>
                  Search and apply a tighter font stack without leaving the
                  editor shell.
                </PopoverDescription>
              </PopoverHeader>
              <div className="ahtml-gallery-font-picker-search">
                <Search
                  aria-hidden="true"
                  className="ahtml-gallery-font-picker-search-icon"
                />
                <Input
                  className="ahtml-gallery-control-input-mono ahtml-gallery-font-picker-search-input"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search fonts..."
                  value={search}
                />
              </div>
              <ScrollArea className="ahtml-gallery-font-picker-list-scroll">
                <div className="ahtml-gallery-font-picker-list">
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                      <button
                        className={[
                          "ahtml-gallery-font-picker-option",
                          option.value === value ? "is-active" : null,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        key={option.value}
                        onClick={() => {
                          onChange(option.value)
                          setOpen(false)
                          setSearch("")
                        }}
                        type="button"
                      >
                        <span className="ahtml-gallery-font-picker-option-copy">
                          <strong style={{ fontFamily: option.value }}>
                            {option.label}
                          </strong>
                          <span>{option.category}</span>
                        </span>
                        {option.value === value ? (
                          <Check aria-hidden="true" />
                        ) : null}
                      </button>
                    ))
                  ) : (
                    <div className="ahtml-gallery-font-picker-empty">
                      No matching font presets.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </Field>
      <LabeledInput
        description="Raw font-family stack for custom fallback tuning."
        label={`${label} Stack`}
        mono
        onChange={onChange}
        value={value}
      />
    </div>
  )
}

export function SliderInputField({
  description,
  focused = false,
  label,
  max,
  min,
  onChange,
  step,
  unit,
  value,
}: {
  description?: string
  focused?: boolean
  label: string
  max: number
  min: number
  onChange: (value: number) => void
  step: number
  unit: string
  value: number
}) {
  const id = React.useId()
  const rootRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!focused) {
      return
    }

    rootRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }, [focused])

  return (
    <Field
      className={[
        "ahtml-gallery-control-row",
        focused ? "ahtml-gallery-control-row-focused" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      ref={rootRef}
    >
      <div className="ahtml-gallery-control-copy">
        <FieldLabel className="ahtml-gallery-control-label" htmlFor={id}>
          {label}
        </FieldLabel>
        {description ? (
          <FieldDescription className="ahtml-gallery-control-description">
            {description}
          </FieldDescription>
        ) : null}
      </div>
      <div className="ahtml-gallery-slider-field">
        <Slider
          className="ahtml-gallery-slider-control"
          id={id}
          max={max}
          min={min}
          onValueChange={(values) => onChange(values[0] ?? value)}
          step={step}
          value={[value]}
        />
        <div className="ahtml-gallery-slider-input-wrap">
          <Input
            className="ahtml-gallery-control-input ahtml-gallery-control-input-mono"
            onChange={(event) => {
              const nextValue = Number.parseFloat(event.target.value)

              if (!Number.isNaN(nextValue)) {
                onChange(Math.min(max, Math.max(min, nextValue)))
              }
            }}
            value={value}
          />
          <span className="ahtml-gallery-slider-unit">{unit}</span>
        </div>
      </div>
    </Field>
  )
}

export function FieldRow({
  label,
  multiline = false,
  value,
}: {
  label: string
  multiline?: boolean
  value: string
}) {
  return (
    <Field className="ahtml-gallery-field-row">
      <div className="ahtml-gallery-control-copy">
        <FieldTitle className="ahtml-gallery-control-label">{label}</FieldTitle>
      </div>
      <FieldContent className="ahtml-gallery-control-value">
        <strong
          className={[
            "ahtml-gallery-control-readout",
            multiline ? "ahtml-gallery-wrap" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {value}
        </strong>
      </FieldContent>
    </Field>
  )
}

export function GalleryPanelBody({ children }: React.PropsWithChildren) {
  return (
    <div className="ahtml-gallery-stack ahtml-gallery-panel-body">
      {children}
    </div>
  )
}
