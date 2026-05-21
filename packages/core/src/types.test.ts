import { describe, expect, it } from "vitest"

import type {
  ArtifactProfileReference,
  ComponentSchema,
  ComponentExposurePolicy,
  ComponentSchemaOverlay,
  ComponentSemanticContract,
  GeneratedShadcnIntrospection,
  PropExposureState,
  RenderConfig,
  ResolvedComponentSchema,
  SanitizedAgentHtml,
} from "./types"

describe("agent-html public types", () => {
  it("models a checked render config with an artifact profile reference", () => {
    const profileReference = "shadcn-default" satisfies ArtifactProfileReference
    const customProfileReference =
      "team-ops" satisfies ArtifactProfileReference
    const meta = {
      artifactProfileReference: profileReference,
      artifactProfile: {
        id: profileReference,
        globalStyle: {
          tokenSets: {
            light: {
              background: "#f7f7f4",
              foreground: "#26251e",
              card: "#ffffff",
              cardForeground: "#26251e",
              popover: "#ffffff",
              popoverForeground: "#26251e",
              primary: "#f54e00",
              primaryForeground: "#ffffff",
              secondary: "#fafaf7",
              secondaryForeground: "#26251e",
              muted: "#fafaf7",
              mutedForeground: "#807d72",
              accent: "#fafaf7",
              accentForeground: "#26251e",
              destructive: "#cf2d56",
              destructiveForeground: "#ffffff",
              border: "#e6e5e0",
              input: "#cfcdc4",
              ring: "#f54e00",
              chart1: "oklch(0.81 0.1 252)",
              chart2: "oklch(0.62 0.19 260)",
              chart3: "oklch(0.55 0.22 263)",
              chart4: "oklch(0.49 0.22 264)",
              chart5: "oklch(0.42 0.18 266)",
              sidebar: "oklch(0.985 0 0)",
              sidebarForeground: "#26251e",
              sidebarPrimary: "#26251e",
              sidebarPrimaryForeground: "oklch(0.985 0 0)",
              sidebarAccent: "#fafaf7",
              sidebarAccentForeground: "#26251e",
              sidebarBorder: "#e6e5e0",
              sidebarRing: "oklch(0.708 0 0)",
            },
            dark: {
              background: "oklch(0.145 0 0)",
              foreground: "oklch(0.985 0 0)",
              card: "oklch(0.205 0 0)",
              cardForeground: "oklch(0.985 0 0)",
              popover: "oklch(0.205 0 0)",
              popoverForeground: "oklch(0.985 0 0)",
              primary: "oklch(0.922 0 0)",
              primaryForeground: "oklch(0.205 0 0)",
              secondary: "oklch(0.269 0 0)",
              secondaryForeground: "oklch(0.985 0 0)",
              muted: "oklch(0.269 0 0)",
              mutedForeground: "oklch(0.708 0 0)",
              accent: "oklch(0.269 0 0)",
              accentForeground: "oklch(0.985 0 0)",
              destructive: "oklch(0.704 0.191 22.216)",
              destructiveForeground: "oklch(0.985 0 0)",
              border: "oklch(1 0 0 / 10%)",
              input: "oklch(1 0 0 / 15%)",
              ring: "oklch(0.556 0 0)",
              chart1: "oklch(0.81 0.1 252)",
              chart2: "oklch(0.62 0.19 260)",
              chart3: "oklch(0.55 0.22 263)",
              chart4: "oklch(0.49 0.22 264)",
              chart5: "oklch(0.42 0.18 266)",
              sidebar: "oklch(0.205 0 0)",
              sidebarForeground: "oklch(0.985 0 0)",
              sidebarPrimary: "oklch(0.488 0.243 264.376)",
              sidebarPrimaryForeground: "oklch(0.985 0 0)",
              sidebarAccent: "oklch(0.269 0 0)",
              sidebarAccentForeground: "oklch(0.985 0 0)",
              sidebarBorder: "oklch(0.275 0 0)",
              sidebarRing: "oklch(0.439 0 0)",
            },
          },
          radiusScale: {
            base: "0.75rem",
            sm: "calc(var(--radius) * 0.6)",
            md: "calc(var(--radius) * 0.8)",
            lg: "var(--radius)",
            xl: "calc(var(--radius) * 1.4)",
            "2xl": "calc(var(--radius) * 1.8)",
            "3xl": "calc(var(--radius) * 2.2)",
            "4xl": "calc(var(--radius) * 2.6)",
          },
          typography: {
            fontSans:
              '"Inter Variable", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
            fontHeading: "var(--font-sans)",
            fontSerif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
            fontMono:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            letterSpacing: "0em",
            spacing: "0.25rem",
            shadowColor: "oklch(0 0 0)",
            shadowOpacity: "0.1",
            shadowBlur: "3px",
            shadowSpread: "0px",
            shadowOffsetX: "0px",
            shadowOffsetY: "1px",
          },
          cssVariableMap: {
            background: "--background",
            foreground: "--foreground",
            card: "--card",
            cardForeground: "--card-foreground",
            popover: "--popover",
            popoverForeground: "--popover-foreground",
            primary: "--primary",
            primaryForeground: "--primary-foreground",
            secondary: "--secondary",
            secondaryForeground: "--secondary-foreground",
            muted: "--muted",
            mutedForeground: "--muted-foreground",
            accent: "--accent",
            accentForeground: "--accent-foreground",
            destructive: "--destructive",
            destructiveForeground: "--destructive-foreground",
            border: "--border",
            input: "--input",
            ring: "--ring",
            chart1: "--chart-1",
            chart2: "--chart-2",
            chart3: "--chart-3",
            chart4: "--chart-4",
            chart5: "--chart-5",
            sidebar: "--sidebar",
            sidebarForeground: "--sidebar-foreground",
            sidebarPrimary: "--sidebar-primary",
            sidebarPrimaryForeground: "--sidebar-primary-foreground",
            sidebarAccent: "--sidebar-accent",
            sidebarAccentForeground: "--sidebar-accent-foreground",
            sidebarBorder: "--sidebar-border",
            sidebarRing: "--sidebar-ring",
            radius: "--radius",
            fontSans: "--font-sans",
            fontHeading: "--font-heading",
            fontSerif: "--font-serif",
            fontMono: "--font-mono",
            letterSpacing: "--letter-spacing",
            spacing: "--spacing",
            shadowColor: "--shadow-color",
            shadowOpacity: "--shadow-opacity",
            shadowBlur: "--shadow-blur",
            shadowSpread: "--shadow-spread",
            shadowOffsetX: "--shadow-offset-x",
            shadowOffsetY: "--shadow-offset-y",
          },
        },
        globalLayout: {
          frame: {
            pageMaxWidth: "72rem",
            pagePaddingInline: "1rem",
            pagePaddingBlockStart: "1.5rem",
            pagePaddingBlockEnd: "3rem",
            frameMaxWidth: "64rem",
          },
          measure: {
            prose: "68ch",
            wide: "84ch",
            full: "100%",
          },
          rhythm: {
            pageGap: "1.25rem",
            stackGap: "1rem",
            clusterGap: "0.75rem",
            splitGap: "1rem",
            gridGap: "1rem",
            switcherGap: "1rem",
          },
          density: {
            default: "balanced",
            compact: 0.85,
            balanced: 1,
            relaxed: 1.2,
          },
          partition: {
            splitMinColumnWidth: "18rem",
            gridMinColumnWidth: "16rem",
            switcherMinChildWidth: "18rem",
          },
          reflow: {
            splitAutoFlow: "auto-fit",
            gridAutoFlow: "auto-fit",
            clusterWrap: "wrap",
            switcherWrap: "wrap",
            clusterJustify: "flex-start",
            switcherJustify: "flex-start",
          },
        },
        componentStyle: {},
        componentLayout: {
          page: {
            gap: "1.25rem",
            measure: "wide",
          },
          stack: {
            gap: "1rem",
            density: "balanced",
            measure: "full",
          },
          cluster: {
            gap: "0.75rem",
            density: "balanced",
            wrap: "wrap",
            justify: "flex-start",
          },
          split: {
            gap: "1rem",
            density: "balanced",
            minColumnWidth: "18rem",
            autoFlow: "auto-fit",
          },
          grid: {
            gap: "1rem",
            density: "balanced",
            minColumnWidth: "16rem",
            autoFlow: "auto-fit",
          },
          switcher: {
            gap: "1rem",
            density: "balanced",
            minChildWidth: "18rem",
            wrap: "wrap",
            justify: "flex-start",
          },
          frame: {
            maxWidth: "64rem",
            measure: "wide",
          },
        },
      },
    } satisfies RenderConfig

    const pageComponentSchema = {
      name: "page",
      description: "Page root component.",
      props: [
        {
          name: "title",
          valueKind: "string",
          required: true,
        },
      ],
      allowedChildren: ["card", "table", "list"],
    } satisfies ComponentSchema

    const document = {
      meta,
      components: [
        {
          type: "component",
          name: "page",
          props: {
            title: "Payment Review",
          },
          children: [
            {
              type: "text",
              value: "Checked content only.",
            },
          ],
        },
      ],
    } satisfies SanitizedAgentHtml

    expect(pageComponentSchema.name).toBe("page")
    expect(customProfileReference).toBe("team-ops")
    expect(document.meta.artifactProfileReference).toBe("shadcn-default")
    expect(document.meta.artifactProfile.id).toBe("shadcn-default")
    expect(document.meta.artifactProfile.globalStyle.cssVariableMap.radius).toBe(
      "--radius",
    )
    expect(document.meta.artifactProfile.componentLayout.frame.maxWidth).toBe(
      "64rem",
    )
    expect(document.components[0]?.name).toBe("page")
  })

  it("models shadcn introspection and explicit schema overlay separately", () => {
    const introspection = {
      registryName: "button",
      componentName: "Button",
      exports: ["Button", "buttonVariants"],
      slots: ["button"],
      variantProps: {
        variant: ["default", "secondary"],
      },
      blockedProps: ["className", "style", "asChild"],
      dependencies: ["class-variance-authority", "radix-ui", "react"],
      registryDependencies: [],
    } satisfies GeneratedShadcnIntrospection

    const overlay = {
      name: "button",
      description: "Semantic button action.",
      expose: true,
      sourceComponents: ["Button"],
      props: [
        {
          name: "intent",
          valueKind: "enum",
          enumValues: ["primary", "secondary"],
        },
      ],
      hiddenProps: ["variant", "className", "style", "asChild"],
    } satisfies ComponentSchemaOverlay

    expect(introspection.variantProps?.variant).toContain("default")
    expect(overlay.hiddenProps).toContain("className")
  })

  it("separates semantic contracts, exposure policy, and resolved schema types", () => {
    const exposureState = "raw-candidate" satisfies PropExposureState
    const semanticContract = {
      name: "alert",
      description: "Important callout or warning.",
      expose: true,
      sourceComponents: ["Alert"],
      semanticProps: [
        {
          name: "title",
          valueKind: "string",
          origin: "content",
        },
      ],
      allowedChildren: ["#text"],
    } satisfies ComponentSemanticContract
    const exposurePolicy = {
      component: "alert",
      rawCandidates: ["variant"],
      lockedRawCandidates: ["variant"],
    } satisfies ComponentExposurePolicy
    const resolvedSchema = {
      name: "alert",
      description: "Important callout or warning.",
      props: [
        {
          name: "title",
          valueKind: "string",
        },
        {
          name: "variant",
          valueKind: "enum",
          enumValues: ["default", "destructive"],
        },
      ],
      allowedChildren: ["#text"],
      semanticProps: semanticContract.semanticProps ?? [],
      exposedRawProps: [
        {
          name: "variant",
          valueKind: "enum",
          enumValues: ["default", "destructive"],
        },
      ],
    } satisfies ResolvedComponentSchema

    expect(exposureState).toBe("raw-candidate")
    expect(semanticContract.semanticProps?.[0]?.origin).toBe("content")
    expect(exposurePolicy.lockedRawCandidates).toContain("variant")
    expect(resolvedSchema.semanticProps[0]?.origin).toBe("content")
  })
})
