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
      artifactProfileReference: "shadcn-default",
      artifactProfile: {
        id: "shadcn-default",
        globalStyle: {
          tokenSets: {
            light: expect.objectContaining({
              background: "#f7f7f5",
              foreground: "#111827",
              border: "#d9ddd6",
            }),
            dark: expect.objectContaining({
              background: "oklch(0.145 0 0)",
              foreground: "oklch(0.985 0 0)",
              border: "oklch(1 0 0 / 10%)",
            }),
          },
          radiusScale: expect.objectContaining({
            base: "0.625rem",
            lg: "var(--radius)",
          }),
          typography: expect.objectContaining({
            fontSans: expect.stringContaining("Inter"),
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
            pageMaxWidth: "80rem",
            frameMaxWidth: "72rem",
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
          treatments: {},
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
            maxWidth: "72rem",
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

    expect(parseRenderConfig({ "profile-ref": "shadcn-default" })).toEqual({
      artifactProfileReference: "shadcn-default",
      artifactProfile: {
        id: "shadcn-default",
        globalStyle: {
          tokenSets: {
            light: expect.objectContaining({
              primary: "#111827",
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
          treatments: {},
        },
        componentLayout: expect.any(Object),
      },
    })
  })

  it("accepts resolved user artifact profiles through a runtime resolver", () => {
    const baseRenderConfig = parseRenderConfig({ "profile-ref": "shadcn-default" })
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
      componentStyle: {},
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
    const config = parseRenderConfig({ "profile-ref": "shadcn-default" })

    expect(() =>
      RenderConfigSchema.parse({
        ...config,
        artifactProfile: {
          ...config.artifactProfile,
          id: "team-mismatch",
        },
      }),
    ).toThrow()
  })

  it("falls back to the default profile for invalid render config input", () => {
    expect(
      parseRenderConfig({
        "style-ref": "shadcn-default",
      }),
    ).toEqual(DEFAULT_RENDER_CONFIG)

    expect(
      parseRenderConfig({
        className: "text-red-500",
      }),
    ).toEqual(DEFAULT_RENDER_CONFIG)

    expect(
      parseRenderConfig({
        profile: "shadcn-default",
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

  it("falls back to the default profile for unresolved but well-formed references", () => {
    expect(parseRenderConfig({ "profile-ref": "team-missing" })).toEqual(
      DEFAULT_RENDER_CONFIG,
    )
  })

  it("reports explicit resolution reasons for profile-ref parsing outcomes", () => {
    expect(resolveRenderConfig({ "profile-ref": "shadcn-default" })).toMatchObject({
      reason: "explicit-profile-ref",
      requestedProfileRef: "shadcn-default",
      config: {
        artifactProfileReference: "shadcn-default",
      },
    })

    expect(resolveRenderConfig({ profile: "shadcn-default" })).toMatchObject({
      reason: "invalid-profile-ref-shape",
      config: DEFAULT_RENDER_CONFIG,
    })

    expect(resolveRenderConfig({ "style-ref": "shadcn-default" })).toMatchObject({
      reason: "legacy-style-ref",
      requestedProfileRef: "shadcn-default",
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
      "profile-ref": "shadcn-default",
    })
    expect(PUBLIC_ARTIFACT_PROFILE_REFERENCE_VALUES).toEqual([
      "shadcn-default",
    ])
    expect(PUBLIC_RENDER_CONFIG_KEY).toBe("profile-ref")
    expect(RENDER_CONFIG_KEYS).toEqual(["profile-ref"])
    expect(Object.keys(RENDER_CONFIG_VALUES)).toEqual(RENDER_CONFIG_KEYS)
  })
})
