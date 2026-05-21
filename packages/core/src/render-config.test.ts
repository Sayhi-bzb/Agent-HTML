import { describe, expect, it } from "vitest"

import {
  DEFAULT_RENDER_CONFIG,
  parseRenderConfig,
  PUBLIC_ARTIFACT_PROFILE_REFERENCE_VALUES,
  PUBLIC_RENDER_CONFIG_KEY,
  PUBLIC_RENDER_CONFIG_DEFAULTS,
  RENDER_CONFIG_KEYS,
  RENDER_CONFIG_VALUES,
  RenderConfigSchema,
  resolveRenderConfig,
} from "./render-config"

describe("artifact profile render config", () => {
  it("accepts approved artifact profile reference values", () => {
    expect(RenderConfigSchema.parse(DEFAULT_RENDER_CONFIG)).toEqual({
      artifactProfileReference: "report-default",
      artifactProfile: {
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
        globalLayout: {
          frame: expect.objectContaining({
            pageMaxWidth: "72rem",
            frameMaxWidth: "64rem",
          }),
          measure: expect.objectContaining({
            prose: "68ch",
            wide: "84ch",
          }),
          rhythm: expect.objectContaining({
            pageGap: "1.25rem",
            stackGap: "1rem",
          }),
          density: expect.objectContaining({
            default: "balanced",
            compact: 0.85,
          }),
          partition: expect.objectContaining({
            splitMinColumnWidth: "18rem",
            gridMinColumnWidth: "16rem",
          }),
          reflow: expect.objectContaining({
            splitAutoFlow: "auto-fit",
            clusterWrap: "wrap",
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
        componentLayout: {
          page: expect.objectContaining({
            gap: "1.25rem",
            measure: "wide",
          }),
          stack: expect.objectContaining({
            gap: "1rem",
            density: "balanced",
          }),
          frame: expect.objectContaining({
            maxWidth: "64rem",
            measure: "wide",
          }),
          split: expect.objectContaining({
            minColumnWidth: "18rem",
          }),
          grid: expect.objectContaining({
            minColumnWidth: "16rem",
          }),
          switcher: expect.objectContaining({
            minChildWidth: "18rem",
          }),
          cluster: expect.objectContaining({
            wrap: "wrap",
          }),
        },
      },
    })

    expect(parseRenderConfig({ "profile-ref": "ops-compact" })).toEqual({
      artifactProfileReference: "ops-compact",
      artifactProfile: {
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
        globalLayout: expect.any(Object),
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
        componentLayout: expect.any(Object),
      },
    })
  })

  it("accepts resolved user artifact profiles through a runtime resolver", () => {
    const baseRenderConfig = parseRenderConfig({ "profile-ref": "ops-compact" })
    const customArtifactProfile: ReturnType<
      typeof parseRenderConfig
    >["artifactProfile"] = {
      ...baseRenderConfig.artifactProfile,
      id: "team-ops",
      globalStyle: {
        ...baseRenderConfig.artifactProfile.globalStyle,
        tokenSets: {
          light: {
            ...baseRenderConfig.artifactProfile.globalStyle.tokenSets.light,
            background: "#fcfbf8",
            primary: "#0f766e",
          },
          dark: {
            ...baseRenderConfig.artifactProfile.globalStyle.tokenSets.dark,
            background: "oklch(0.18 0.02 190)",
            primary: "oklch(0.74 0.11 190)",
          },
        },
      },
      componentStyle: {
        treatments: {
          ...baseRenderConfig.artifactProfile.componentStyle.treatments,
          card: "review-card",
        },
      },
      globalLayout: {
        ...baseRenderConfig.artifactProfile.globalLayout,
        frame: {
          ...baseRenderConfig.artifactProfile.globalLayout.frame,
          pageMaxWidth: "80rem",
        },
      },
      componentLayout: {
        ...baseRenderConfig.artifactProfile.componentLayout,
        frame: {
          ...baseRenderConfig.artifactProfile.componentLayout.frame,
          maxWidth: "72rem",
        },
      },
    }

    const resolved = parseRenderConfig(
      { "profile-ref": "team-ops" },
      {
        resolveArtifactProfileReference: (reference: string) =>
          reference === "team-ops" ? customArtifactProfile : undefined,
      },
    )

    expect(RenderConfigSchema.parse(resolved)).toEqual({
      artifactProfileReference: "team-ops",
      artifactProfile: customArtifactProfile,
    })
  })

  it("rejects resolved artifact profiles that do not match the selected reference", () => {
    const config = parseRenderConfig({ "profile-ref": "ops-compact" })

    expect(() =>
      RenderConfigSchema.parse({
        ...config,
        artifactProfile: {
          ...config.artifactProfile,
          id: "report-default",
        },
      }),
    ).toThrow()
  })

  it("falls back to the default profile for invalid render config input", () => {
    expect(
      parseRenderConfig({
        className: "text-red-500",
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

  it("treats legacy style-ref as invalid and reports it explicitly", () => {
    expect(
      parseRenderConfig({
        "style-ref": "ops-compact",
      }),
    ).toEqual(DEFAULT_RENDER_CONFIG)

    expect(resolveRenderConfig({ "style-ref": "ops-compact" })).toMatchObject({
      reason: "legacy-style-ref",
      requestedLegacyStyleRef: "ops-compact",
      config: DEFAULT_RENDER_CONFIG,
    })
  })

  it("falls back to the default profile for unresolved but well-formed references", () => {
    expect(parseRenderConfig({ "profile-ref": "team-missing" })).toEqual(
      DEFAULT_RENDER_CONFIG,
    )
  })

  it("reports explicit resolution reasons for profile-ref parsing outcomes", () => {
    expect(resolveRenderConfig({ "profile-ref": "ops-compact" })).toMatchObject({
      reason: "explicit-profile-ref",
      requestedProfileRef: "ops-compact",
      config: {
        artifactProfileReference: "ops-compact",
      },
    })

    expect(resolveRenderConfig({ profile: "ops-compact" })).toMatchObject({
      reason: "invalid-profile-ref-shape",
      config: DEFAULT_RENDER_CONFIG,
    })

    expect(resolveRenderConfig(undefined)).toMatchObject({
      reason: "missing-profile-ref",
      config: DEFAULT_RENDER_CONFIG,
    })

    expect(
      resolveRenderConfig({ "profile-ref": "team-missing" }),
    ).toMatchObject({
      reason: "unknown-profile-ref",
      requestedProfileRef: "team-missing",
      config: DEFAULT_RENDER_CONFIG,
    })
  })

  it("exposes only the public render config keys", () => {
    expect(PUBLIC_RENDER_CONFIG_DEFAULTS).toEqual({
      "profile-ref": "report-default",
    })
    expect(PUBLIC_ARTIFACT_PROFILE_REFERENCE_VALUES).toEqual([
      "report-default",
      "ops-compact",
      "review-dense",
    ])
    expect(PUBLIC_RENDER_CONFIG_KEY).toBe("profile-ref")
    expect(RENDER_CONFIG_KEYS).toEqual(["profile-ref"])
    expect(Object.keys(RENDER_CONFIG_VALUES)).toEqual(RENDER_CONFIG_KEYS)
  })
})
