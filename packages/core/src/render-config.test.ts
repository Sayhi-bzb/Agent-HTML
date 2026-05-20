import { describe, expect, it } from "vitest"

import {
  DEFAULT_RENDER_CONFIG,
  parseRenderConfig,
  PUBLIC_DOCUMENT_STYLE_CONFIG_REFERENCE_VALUES,
  PUBLIC_RENDER_CONFIG_KEY,
  PUBLIC_RENDER_CONFIG_DEFAULTS,
  RENDER_CONFIG_KEYS,
  RENDER_CONFIG_VALUES,
  RenderConfigSchema,
  resolveRenderConfig,
} from "./render-config"

describe("document-style-config render config", () => {
  it("accepts approved document style config reference values", () => {
    expect(RenderConfigSchema.parse(DEFAULT_RENDER_CONFIG)).toEqual({
      documentStyleConfigReference: "report-default",
      styleProfile: {
        id: "report-default",
        globalStyle: {
          tokenSets: {
            light: expect.objectContaining({
              background: "#f7f7f4",
              foreground: "#26251e",
              border: "#e6e5e0",
            }),
            dark: expect.objectContaining({
              background: "oklch(0.145 0 0)",
              foreground: "oklch(0.985 0 0)",
              border: "oklch(1 0 0 / 10%)",
            }),
          },
          radiusScale: expect.objectContaining({
            base: "0.75rem",
            lg: "var(--radius)",
          }),
          typography: expect.objectContaining({
            fontSans: expect.stringContaining("Inter Variable"),
            fontHeading: "var(--font-sans)",
            spacing: "0.25rem",
            shadowOpacity: "0.1",
          }),
          cssVariableMap: expect.objectContaining({
            background: "--background",
            foreground: "--foreground",
            radius: "--radius",
            spacing: "--spacing",
          }),
        },
        componentStyle: {
          treatments: {
            alert: "report-alert",
            badge: "report-badge",
            card: "report-card",
            input: "report-field",
            table: "report-table",
            tabs: "report-tabs",
            textarea: "report-field",
          },
        },
      },
    })

    expect(parseRenderConfig({ "style-ref": "ops-compact" })).toEqual({
      documentStyleConfigReference: "ops-compact",
      styleProfile: {
        id: "ops-compact",
        globalStyle: {
          tokenSets: {
            light: expect.objectContaining({
              primary: "#f54e00",
              card: "#ffffff",
            }),
            dark: expect.objectContaining({
              primary: "oklch(0.922 0 0)",
              card: "oklch(0.205 0 0)",
            }),
          },
          radiusScale: expect.objectContaining({
            md: "calc(var(--radius) * 0.8)",
            "4xl": "calc(var(--radius) * 2.6)",
          }),
          typography: expect.objectContaining({
            fontHeading: "var(--font-sans)",
            shadowBlur: "3px",
          }),
          cssVariableMap: expect.objectContaining({
            primary: "--primary",
            fontHeading: "--font-heading",
            shadowColor: "--shadow-color",
          }),
        },
        componentStyle: {
          treatments: {
            alert: "ops-alert",
            badge: "ops-badge",
            card: "ops-card",
            input: "ops-field",
            table: "ops-table",
            tabs: "ops-tabs",
            textarea: "ops-field",
          },
        },
      },
    })
  })

  it("accepts resolved user style profiles through a runtime resolver", () => {
    const baseRenderConfig = parseRenderConfig({ "style-ref": "ops-compact" })
    const customStyleProfile: ReturnType<
      typeof parseRenderConfig
    >["styleProfile"] = {
      ...baseRenderConfig.styleProfile,
      id: "team-ops",
      globalStyle: {
        ...baseRenderConfig.styleProfile.globalStyle,
        tokenSets: {
          light: {
            ...baseRenderConfig.styleProfile.globalStyle.tokenSets.light,
            background: "#fcfbf8",
            primary: "#0f766e",
          },
        dark: {
          ...baseRenderConfig.styleProfile.globalStyle.tokenSets.dark,
          background: "oklch(0.18 0.02 190)",
          primary: "oklch(0.74 0.11 190)",
        },
      },
    },
    componentStyle: {
      treatments: {
        ...baseRenderConfig.styleProfile.componentStyle.treatments,
          card: "review-card",
        },
      },
    }

    const resolved = parseRenderConfig(
      { "style-ref": "team-ops" },
      {
        resolveStyleProfileReference: (reference) =>
          reference === "team-ops" ? customStyleProfile : undefined,
      },
    )

    expect(RenderConfigSchema.parse(resolved)).toEqual({
      documentStyleConfigReference: "team-ops",
      styleProfile: customStyleProfile,
    })
  })

  it("rejects resolved style profiles that do not match the selected reference", () => {
    const config = parseRenderConfig({ "style-ref": "ops-compact" })

    expect(() =>
      RenderConfigSchema.parse({
        ...config,
        styleProfile: {
          ...config.styleProfile,
          id: "report-default",
        },
      }),
    ).toThrow()
  })

  it("falls back to the default profile for invalid or legacy render config input", () => {
    expect(
      parseRenderConfig({
        className: "text-red-500",
      }),
    ).toEqual(DEFAULT_RENDER_CONFIG)

    expect(
      parseRenderConfig({
        "style-ref": "color:red",
      }),
    ).toEqual(DEFAULT_RENDER_CONFIG)

    expect(
      parseRenderConfig({
        profile: "ops-compact",
      }),
    ).toEqual(DEFAULT_RENDER_CONFIG)

    expect(
      parseRenderConfig({
        theme: "neutral",
        density: "compact",
        tone: "dashboard",
        width: "dashboard",
      }),
    ).toEqual(DEFAULT_RENDER_CONFIG)
  })

  it("falls back to the default profile for unresolved but well-formed style references", () => {
    expect(parseRenderConfig({ "style-ref": "team-missing" })).toEqual(
      DEFAULT_RENDER_CONFIG,
    )
  })

  it("reports explicit resolution reasons for style-ref parsing outcomes", () => {
    expect(resolveRenderConfig({ "style-ref": "ops-compact" })).toMatchObject({
      reason: "explicit-style-ref",
      requestedStyleRef: "ops-compact",
      config: {
        documentStyleConfigReference: "ops-compact",
      },
    })

    expect(resolveRenderConfig({ profile: "ops-compact" })).toMatchObject({
      reason: "invalid-style-ref-shape",
      config: DEFAULT_RENDER_CONFIG,
    })

    expect(resolveRenderConfig(undefined)).toMatchObject({
      reason: "missing-style-ref",
      config: DEFAULT_RENDER_CONFIG,
    })

    expect(resolveRenderConfig({ "style-ref": "team-missing" })).toMatchObject({
      reason: "unknown-style-ref",
      requestedStyleRef: "team-missing",
      config: DEFAULT_RENDER_CONFIG,
    })
  })

  it("exposes only the public render config keys", () => {
    expect(PUBLIC_RENDER_CONFIG_DEFAULTS).toEqual({
      "style-ref": "report-default",
    })
    expect(PUBLIC_DOCUMENT_STYLE_CONFIG_REFERENCE_VALUES).toEqual([
      "report-default",
      "ops-compact",
      "review-dense",
    ])
    expect(PUBLIC_RENDER_CONFIG_KEY).toBe("style-ref")
    expect(RENDER_CONFIG_KEYS).toEqual(["style-ref"])
    expect(Object.keys(RENDER_CONFIG_VALUES)).toEqual(RENDER_CONFIG_KEYS)
  })
})
