import { z } from "zod"

import type {
  ArtifactProfile,
  ArtifactProfileReference,
  BuiltinArtifactProfileReference,
  ComponentLayoutProfile,
  ComponentStyleProfile,
  CssVariableMap,
  GlobalLayoutProfile,
  GlobalStyleProfile,
  LayoutMeasureToken,
  RadiusScale,
  RenderConfig,
  ResolvedRenderConfig,
  SemanticColorTokenSet,
  TypographyProfile,
} from "./types"

export const PUBLIC_RENDER_CONFIG_MODEL = "artifact-profile-reference"
export const ARTIFACT_PROFILE_STORAGE_VERSION = 2

export const PUBLIC_RENDER_CONFIG_KEY = "profile-ref" as const
export const PUBLIC_ARTIFACT_PROFILE_REFERENCE_VALUES = [
  "shadcn-default",
] as const satisfies readonly BuiltinArtifactProfileReference[]

const artifactProfileReferencePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const neutralLightSemanticTokens: SemanticColorTokenSet = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.145 0 0)",
  card: "oklch(1 0 0)",
  cardForeground: "oklch(0.145 0 0)",
  popover: "oklch(1 0 0)",
  popoverForeground: "oklch(0.145 0 0)",
  primary: "oklch(0.205 0 0)",
  primaryForeground: "oklch(0.985 0 0)",
  secondary: "oklch(0.97 0 0)",
  secondaryForeground: "oklch(0.205 0 0)",
  muted: "oklch(0.97 0 0)",
  mutedForeground: "oklch(0.556 0 0)",
  accent: "oklch(0.97 0 0)",
  accentForeground: "oklch(0.205 0 0)",
  destructive: "oklch(0.577 0.245 27.325)",
  destructiveForeground: "oklch(0.985 0 0)",
  border: "oklch(0.922 0 0)",
  input: "oklch(0.922 0 0)",
  ring: "oklch(0.708 0 0)",
  chart1: "oklch(0.646 0.222 41.116)",
  chart2: "oklch(0.6 0.118 184.704)",
  chart3: "oklch(0.398 0.07 227.392)",
  chart4: "oklch(0.828 0.189 84.429)",
  chart5: "oklch(0.769 0.188 70.08)",
  sidebar: "oklch(0.985 0 0)",
  sidebarForeground: "oklch(0.145 0 0)",
  sidebarPrimary: "oklch(0.205 0 0)",
  sidebarPrimaryForeground: "oklch(0.985 0 0)",
  sidebarAccent: "oklch(0.97 0 0)",
  sidebarAccentForeground: "oklch(0.205 0 0)",
  sidebarBorder: "oklch(0.922 0 0)",
  sidebarRing: "oklch(0.708 0 0)",
}

const neutralDarkSemanticTokens: SemanticColorTokenSet = {
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
  chart2: "oklch(0.696 0.17 162.48)",
  chart3: "oklch(0.769 0.188 70.08)",
  chart4: "oklch(0.627 0.265 303.9)",
  chart5: "oklch(0.645 0.246 16.439)",
  sidebar: "oklch(0.205 0 0)",
  sidebarForeground: "oklch(0.985 0 0)",
  sidebarPrimary: "oklch(0.488 0.243 264.376)",
  sidebarPrimaryForeground: "oklch(0.985 0 0)",
  sidebarAccent: "oklch(0.269 0 0)",
  sidebarAccentForeground: "oklch(0.985 0 0)",
  sidebarBorder: "oklch(1 0 0 / 10%)",
  sidebarRing: "oklch(0.556 0 0)",
}

const defaultRadiusScale: RadiusScale = {
  base: "0.625rem",
  sm: "calc(var(--radius) * 0.6)",
  md: "calc(var(--radius) * 0.8)",
  lg: "var(--radius)",
  xl: "calc(var(--radius) * 1.4)",
  "2xl": "calc(var(--radius) * 1.8)",
  "3xl": "calc(var(--radius) * 2.2)",
  "4xl": "calc(var(--radius) * 2.6)",
}

const defaultTypographyProfile: TypographyProfile = {
  fontSans:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
}

const defaultCssVariableMap: CssVariableMap = {
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
}

const defaultGlobalLayoutProfile: GlobalLayoutProfile = {
  frame: {
    pageMaxWidth: "80rem",
    pagePaddingInline: "1rem",
    pagePaddingBlockStart: "1.5rem",
    pagePaddingBlockEnd: "3rem",
    frameMaxWidth: "100%",
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
}

const artifactProfileReferenceSchema = z
  .string()
  .regex(
    artifactProfileReferencePattern,
    "artifact profile references must use lowercase kebab-case ids.",
  )

const densityPostureSchema = z.enum(["compact", "balanced", "relaxed"])
const layoutMeasureTokenSchema = z.enum(["prose", "wide", "full"])
const layoutAutoFlowSchema = z.enum(["auto-fit", "auto-fill"])
const layoutWrapModeSchema = z.enum(["wrap", "nowrap"])
const layoutJustifyModeSchema = z.enum([
  "flex-start",
  "center",
  "space-between",
])

const semanticColorTokenSetSchema = z
  .object({
    background: z.string(),
    foreground: z.string(),
    card: z.string(),
    cardForeground: z.string(),
    popover: z.string(),
    popoverForeground: z.string(),
    primary: z.string(),
    primaryForeground: z.string(),
    secondary: z.string(),
    secondaryForeground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
    accent: z.string(),
    accentForeground: z.string(),
    destructive: z.string(),
    destructiveForeground: z.string(),
    border: z.string(),
    input: z.string(),
    ring: z.string(),
    chart1: z.string(),
    chart2: z.string(),
    chart3: z.string(),
    chart4: z.string(),
    chart5: z.string(),
    sidebar: z.string(),
    sidebarForeground: z.string(),
    sidebarPrimary: z.string(),
    sidebarPrimaryForeground: z.string(),
    sidebarAccent: z.string(),
    sidebarAccentForeground: z.string(),
    sidebarBorder: z.string(),
    sidebarRing: z.string(),
  })
  .strict()

const radiusScaleSchema = z
  .object({
    base: z.string(),
    sm: z.string(),
    md: z.string(),
    lg: z.string(),
    xl: z.string(),
    "2xl": z.string(),
    "3xl": z.string(),
    "4xl": z.string(),
  })
  .strict()

const typographyProfileSchema = z
  .object({
    fontSans: z.string(),
    fontHeading: z.string(),
    fontSerif: z.string(),
    fontMono: z.string(),
    letterSpacing: z.string(),
    spacing: z.string(),
    shadowColor: z.string(),
    shadowOpacity: z.string(),
    shadowBlur: z.string(),
    shadowSpread: z.string(),
    shadowOffsetX: z.string(),
    shadowOffsetY: z.string(),
  })
  .strict()

const cssVariableMapSchema = z
  .object({
    background: z.literal(defaultCssVariableMap.background),
    foreground: z.literal(defaultCssVariableMap.foreground),
    card: z.literal(defaultCssVariableMap.card),
    cardForeground: z.literal(defaultCssVariableMap.cardForeground),
    popover: z.literal(defaultCssVariableMap.popover),
    popoverForeground: z.literal(defaultCssVariableMap.popoverForeground),
    primary: z.literal(defaultCssVariableMap.primary),
    primaryForeground: z.literal(defaultCssVariableMap.primaryForeground),
    secondary: z.literal(defaultCssVariableMap.secondary),
    secondaryForeground: z.literal(defaultCssVariableMap.secondaryForeground),
    muted: z.literal(defaultCssVariableMap.muted),
    mutedForeground: z.literal(defaultCssVariableMap.mutedForeground),
    accent: z.literal(defaultCssVariableMap.accent),
    accentForeground: z.literal(defaultCssVariableMap.accentForeground),
    destructive: z.literal(defaultCssVariableMap.destructive),
    destructiveForeground: z.literal(defaultCssVariableMap.destructiveForeground),
    border: z.literal(defaultCssVariableMap.border),
    input: z.literal(defaultCssVariableMap.input),
    ring: z.literal(defaultCssVariableMap.ring),
    chart1: z.literal(defaultCssVariableMap.chart1),
    chart2: z.literal(defaultCssVariableMap.chart2),
    chart3: z.literal(defaultCssVariableMap.chart3),
    chart4: z.literal(defaultCssVariableMap.chart4),
    chart5: z.literal(defaultCssVariableMap.chart5),
    sidebar: z.literal(defaultCssVariableMap.sidebar),
    sidebarForeground: z.literal(defaultCssVariableMap.sidebarForeground),
    sidebarPrimary: z.literal(defaultCssVariableMap.sidebarPrimary),
    sidebarPrimaryForeground: z.literal(
      defaultCssVariableMap.sidebarPrimaryForeground,
    ),
    sidebarAccent: z.literal(defaultCssVariableMap.sidebarAccent),
    sidebarAccentForeground: z.literal(
      defaultCssVariableMap.sidebarAccentForeground,
    ),
    sidebarBorder: z.literal(defaultCssVariableMap.sidebarBorder),
    sidebarRing: z.literal(defaultCssVariableMap.sidebarRing),
    radius: z.literal(defaultCssVariableMap.radius),
    fontSans: z.literal(defaultCssVariableMap.fontSans),
    fontHeading: z.literal(defaultCssVariableMap.fontHeading),
    fontSerif: z.literal(defaultCssVariableMap.fontSerif),
    fontMono: z.literal(defaultCssVariableMap.fontMono),
    letterSpacing: z.literal(defaultCssVariableMap.letterSpacing),
    spacing: z.literal(defaultCssVariableMap.spacing),
    shadowColor: z.literal(defaultCssVariableMap.shadowColor),
    shadowOpacity: z.literal(defaultCssVariableMap.shadowOpacity),
    shadowBlur: z.literal(defaultCssVariableMap.shadowBlur),
    shadowSpread: z.literal(defaultCssVariableMap.shadowSpread),
    shadowOffsetX: z.literal(defaultCssVariableMap.shadowOffsetX),
    shadowOffsetY: z.literal(defaultCssVariableMap.shadowOffsetY),
  })
  .strict()

const globalStyleProfileSchema = z
  .object({
    tokenSets: z
      .object({
        light: semanticColorTokenSetSchema,
        dark: semanticColorTokenSetSchema,
      })
      .strict(),
    radiusScale: radiusScaleSchema,
    typography: typographyProfileSchema,
    cssVariableMap: cssVariableMapSchema,
  })
  .strict()

const globalLayoutProfileSchema = z
  .object({
    frame: z
      .object({
        pageMaxWidth: z.string(),
        pagePaddingInline: z.string(),
        pagePaddingBlockStart: z.string(),
        pagePaddingBlockEnd: z.string(),
        frameMaxWidth: z.string(),
      })
      .strict(),
    measure: z
      .object({
        prose: z.string(),
        wide: z.string(),
        full: z.string(),
      })
      .strict(),
    rhythm: z
      .object({
        pageGap: z.string(),
        stackGap: z.string(),
        clusterGap: z.string(),
        splitGap: z.string(),
        gridGap: z.string(),
        switcherGap: z.string(),
      })
      .strict(),
    density: z
      .object({
        default: densityPostureSchema,
        compact: z.number().positive(),
        balanced: z.number().positive(),
        relaxed: z.number().positive(),
      })
      .strict(),
    partition: z
      .object({
        splitMinColumnWidth: z.string(),
        gridMinColumnWidth: z.string(),
        switcherMinChildWidth: z.string(),
      })
      .strict(),
    reflow: z
      .object({
        splitAutoFlow: layoutAutoFlowSchema,
        gridAutoFlow: layoutAutoFlowSchema,
        clusterWrap: layoutWrapModeSchema,
        switcherWrap: layoutWrapModeSchema,
        clusterJustify: layoutJustifyModeSchema,
        switcherJustify: layoutJustifyModeSchema,
      })
      .strict(),
  })
  .strict()

const componentStyleProfileSchema = z.object({}).strict()

const componentLayoutProfileSchema = z
  .object({
    page: z
      .object({
        gap: z.string(),
        measure: layoutMeasureTokenSchema,
      })
      .strict(),
    stack: z
      .object({
        gap: z.string(),
        density: densityPostureSchema,
        measure: layoutMeasureTokenSchema,
      })
      .strict(),
    cluster: z
      .object({
        gap: z.string(),
        density: densityPostureSchema,
        wrap: layoutWrapModeSchema,
        justify: layoutJustifyModeSchema,
      })
      .strict(),
    split: z
      .object({
        gap: z.string(),
        density: densityPostureSchema,
        minColumnWidth: z.string(),
        autoFlow: layoutAutoFlowSchema,
      })
      .strict(),
    grid: z
      .object({
        gap: z.string(),
        density: densityPostureSchema,
        minColumnWidth: z.string(),
        autoFlow: layoutAutoFlowSchema,
      })
      .strict(),
    switcher: z
      .object({
        gap: z.string(),
        density: densityPostureSchema,
        minChildWidth: z.string(),
        wrap: layoutWrapModeSchema,
        justify: layoutJustifyModeSchema,
      })
      .strict(),
    frame: z
      .object({
        maxWidth: z.string(),
        measure: layoutMeasureTokenSchema,
      })
      .strict(),
  })
  .strict()

export const ArtifactProfileSchema = z
  .object({
    id: artifactProfileReferenceSchema,
    globalStyle: globalStyleProfileSchema,
    globalLayout: globalLayoutProfileSchema,
    componentStyle: componentStyleProfileSchema,
    componentLayout: componentLayoutProfileSchema,
  })
  .strict()

export const BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE = {
  "shadcn-default": createArtifactProfile("shadcn-default"),
} as const satisfies Readonly<
  Record<BuiltinArtifactProfileReference, ArtifactProfile>
>

const resolvedRenderConfigsByReference = {
  "shadcn-default": createRenderConfigFromArtifactProfile(
    BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE["shadcn-default"],
  ),
} as const satisfies Readonly<
  Record<BuiltinArtifactProfileReference, RenderConfig>
>

const profileRefRenderConfigInputSchema = z
  .object({
    [PUBLIC_RENDER_CONFIG_KEY]: artifactProfileReferenceSchema,
  })
  .strict()

export const RENDER_CONFIG_VALUES = {
  [PUBLIC_RENDER_CONFIG_KEY]: PUBLIC_ARTIFACT_PROFILE_REFERENCE_VALUES,
} as const

export const PUBLIC_RENDER_CONFIG_DEFAULTS = {
  [PUBLIC_RENDER_CONFIG_KEY]: "shadcn-default",
} as const

export const DEFAULT_ARTIFACT_PROFILE_REFERENCE =
  PUBLIC_RENDER_CONFIG_DEFAULTS[PUBLIC_RENDER_CONFIG_KEY]

export const RenderConfigSchema = z
  .object({
    artifactProfileReference: artifactProfileReferenceSchema,
    artifactProfile: ArtifactProfileSchema,
  })
  .strict()
  .superRefine((config, ctx) => {
    if (config.artifactProfileReference !== config.artifactProfile.id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "artifact profile reference must match artifact profile id.",
        path: ["artifactProfileReference"],
      })
    }
  })

export const DEFAULT_RENDER_CONFIG = resolveResolvedArtifactProfileConfig(
  PUBLIC_RENDER_CONFIG_DEFAULTS[PUBLIC_RENDER_CONFIG_KEY],
)

export const RENDER_CONFIG_KEYS = Object.keys(
  RENDER_CONFIG_VALUES,
) as readonly (keyof typeof RENDER_CONFIG_VALUES)[]

export type ParseRenderConfigOptions = {
  readonly resolveArtifactProfileReference?: (
    artifactProfileReference: ArtifactProfileReference,
  ) => ArtifactProfile | undefined
  readonly resolveDefaultArtifactProfileReference?: () =>
    | ArtifactProfile
    | undefined
}

export function parseRenderConfig(
  input: unknown,
  options: ParseRenderConfigOptions = {},
): RenderConfig {
  return resolveRenderConfig(input, options).config
}

export function resolveRenderConfig(
  input: unknown,
  options: ParseRenderConfigOptions = {},
): ResolvedRenderConfig {
  if (
    input &&
    typeof input === "object" &&
    !Array.isArray(input) &&
    "style-ref" in input
  ) {
    return {
      config: resolveDefaultRenderConfig(options),
      reason: "legacy-style-ref",
      requestedProfileRef:
        typeof input["style-ref"] === "string" ? input["style-ref"] : undefined,
    }
  }

  const profileRefInput = profileRefRenderConfigInputSchema.safeParse(input)

  if (!profileRefInput.success) {
    return {
      config: resolveDefaultRenderConfig(options),
      reason:
        input && typeof input === "object" && !Array.isArray(input)
          ? "invalid-profile-ref-shape"
          : "missing-profile-ref",
    }
  }

  const artifactProfileReference =
    profileRefInput.data[PUBLIC_RENDER_CONFIG_KEY]
  const builtinConfig = resolveBuiltinRenderConfig(artifactProfileReference)

  if (builtinConfig) {
    return {
      config: builtinConfig,
      reason: "explicit-profile-ref",
      requestedProfileRef: artifactProfileReference,
    }
  }

  const artifactProfile = options.resolveArtifactProfileReference?.(
    artifactProfileReference,
  )

  if (artifactProfile) {
    return {
      config: createRenderConfigFromArtifactProfile(artifactProfile),
      reason: "resolved-custom-profile-ref",
      requestedProfileRef: artifactProfileReference,
    }
  }

  return {
    config: resolveDefaultRenderConfig(options),
    reason: "unknown-profile-ref",
    requestedProfileRef: artifactProfileReference,
  }
}

export function createRenderConfigFromArtifactProfile(
  artifactProfile: ArtifactProfile,
): RenderConfig {
  const parsedArtifactProfile = ArtifactProfileSchema.parse(
    normalizeArtifactProfile(artifactProfile),
  )

  return {
    artifactProfileReference: parsedArtifactProfile.id,
    artifactProfile: parsedArtifactProfile,
  }
}

export function normalizeArtifactProfile(
  artifactProfile: unknown,
): ArtifactProfile {
  const input = (artifactProfile ?? {}) as Partial<ArtifactProfile> & {
    globalStyle?: Partial<GlobalStyleProfile> & {
      tokenSets?: {
        light?: Partial<SemanticColorTokenSet>
        dark?: Partial<SemanticColorTokenSet>
      }
      typography?: Partial<TypographyProfile>
      cssVariableMap?: Partial<CssVariableMap>
    }
    globalLayout?: Partial<GlobalLayoutProfile> & {
      frame?: Partial<GlobalLayoutProfile["frame"]>
      measure?: Partial<GlobalLayoutProfile["measure"]>
      rhythm?: Partial<GlobalLayoutProfile["rhythm"]>
      density?: Partial<GlobalLayoutProfile["density"]>
      partition?: Partial<GlobalLayoutProfile["partition"]>
      reflow?: Partial<GlobalLayoutProfile["reflow"]>
    }
    componentLayout?: Partial<ComponentLayoutProfile> & {
      page?: Partial<ComponentLayoutProfile["page"]>
      stack?: Partial<ComponentLayoutProfile["stack"]>
      cluster?: Partial<ComponentLayoutProfile["cluster"]>
      split?: Partial<ComponentLayoutProfile["split"]>
      grid?: Partial<ComponentLayoutProfile["grid"]>
      switcher?: Partial<ComponentLayoutProfile["switcher"]>
      frame?: Partial<ComponentLayoutProfile["frame"]>
    }
  }

  return {
    id:
      typeof input.id === "string" && input.id.length > 0
        ? input.id
        : DEFAULT_ARTIFACT_PROFILE_REFERENCE,
    globalStyle: {
      tokenSets: {
        light: {
          ...neutralLightSemanticTokens,
          ...input.globalStyle?.tokenSets?.light,
        },
        dark: {
          ...neutralDarkSemanticTokens,
          ...input.globalStyle?.tokenSets?.dark,
        },
      },
      radiusScale: {
        ...defaultRadiusScale,
        ...input.globalStyle?.radiusScale,
      },
      typography: {
        ...defaultTypographyProfile,
        ...input.globalStyle?.typography,
      },
      cssVariableMap: {
        ...defaultCssVariableMap,
        ...input.globalStyle?.cssVariableMap,
      },
    },
    globalLayout: {
      frame: {
        ...defaultGlobalLayoutProfile.frame,
        ...input.globalLayout?.frame,
      },
      measure: {
        ...defaultGlobalLayoutProfile.measure,
        ...input.globalLayout?.measure,
      },
      rhythm: {
        ...defaultGlobalLayoutProfile.rhythm,
        ...input.globalLayout?.rhythm,
      },
      density: {
        ...defaultGlobalLayoutProfile.density,
        ...input.globalLayout?.density,
      },
      partition: {
        ...defaultGlobalLayoutProfile.partition,
        ...input.globalLayout?.partition,
      },
      reflow: {
        ...defaultGlobalLayoutProfile.reflow,
        ...input.globalLayout?.reflow,
      },
    },
    componentStyle: {},
    componentLayout: normalizeComponentLayoutProfile(
      input.componentLayout,
      input.globalLayout?.rhythm,
      input.globalLayout?.partition,
      input.globalLayout?.reflow,
      input.globalLayout?.measure,
      input.globalLayout?.density,
      input.globalLayout?.frame,
    ),
  }
}

function normalizeComponentLayoutProfile(
  componentLayout: Partial<ComponentLayoutProfile> | undefined,
  rhythm: Partial<GlobalLayoutProfile["rhythm"]> | undefined,
  partition: Partial<GlobalLayoutProfile["partition"]> | undefined,
  reflow: Partial<GlobalLayoutProfile["reflow"]> | undefined,
  measure: Partial<GlobalLayoutProfile["measure"]> | undefined,
  density: Partial<GlobalLayoutProfile["density"]> | undefined,
  frame: Partial<GlobalLayoutProfile["frame"]> | undefined,
): ComponentLayoutProfile {
  return {
    page: {
      gap: componentLayout?.page?.gap ?? rhythm?.pageGap ?? defaultGlobalLayoutProfile.rhythm.pageGap,
      measure: componentLayout?.page?.measure ?? "full",
    },
    stack: {
      gap: componentLayout?.stack?.gap ?? rhythm?.stackGap ?? defaultGlobalLayoutProfile.rhythm.stackGap,
      density: componentLayout?.stack?.density ?? density?.default ?? defaultGlobalLayoutProfile.density.default,
      measure: componentLayout?.stack?.measure ?? "full",
    },
    cluster: {
      gap: componentLayout?.cluster?.gap ?? rhythm?.clusterGap ?? defaultGlobalLayoutProfile.rhythm.clusterGap,
      density: componentLayout?.cluster?.density ?? density?.default ?? defaultGlobalLayoutProfile.density.default,
      wrap: componentLayout?.cluster?.wrap ?? reflow?.clusterWrap ?? defaultGlobalLayoutProfile.reflow.clusterWrap,
      justify:
        componentLayout?.cluster?.justify ??
        reflow?.clusterJustify ??
        defaultGlobalLayoutProfile.reflow.clusterJustify,
    },
    split: {
      gap: componentLayout?.split?.gap ?? rhythm?.splitGap ?? defaultGlobalLayoutProfile.rhythm.splitGap,
      density: componentLayout?.split?.density ?? density?.default ?? defaultGlobalLayoutProfile.density.default,
      minColumnWidth:
        componentLayout?.split?.minColumnWidth ??
        partition?.splitMinColumnWidth ??
        defaultGlobalLayoutProfile.partition.splitMinColumnWidth,
      autoFlow:
        componentLayout?.split?.autoFlow ??
        reflow?.splitAutoFlow ??
        defaultGlobalLayoutProfile.reflow.splitAutoFlow,
    },
    grid: {
      gap: componentLayout?.grid?.gap ?? rhythm?.gridGap ?? defaultGlobalLayoutProfile.rhythm.gridGap,
      density: componentLayout?.grid?.density ?? density?.default ?? defaultGlobalLayoutProfile.density.default,
      minColumnWidth:
        componentLayout?.grid?.minColumnWidth ??
        partition?.gridMinColumnWidth ??
        defaultGlobalLayoutProfile.partition.gridMinColumnWidth,
      autoFlow:
        componentLayout?.grid?.autoFlow ??
        reflow?.gridAutoFlow ??
        defaultGlobalLayoutProfile.reflow.gridAutoFlow,
    },
    switcher: {
      gap:
        componentLayout?.switcher?.gap ??
        rhythm?.switcherGap ??
        defaultGlobalLayoutProfile.rhythm.switcherGap,
      density:
        componentLayout?.switcher?.density ??
        density?.default ??
        defaultGlobalLayoutProfile.density.default,
      minChildWidth:
        componentLayout?.switcher?.minChildWidth ??
        partition?.switcherMinChildWidth ??
        defaultGlobalLayoutProfile.partition.switcherMinChildWidth,
      wrap:
        componentLayout?.switcher?.wrap ??
        reflow?.switcherWrap ??
        defaultGlobalLayoutProfile.reflow.switcherWrap,
      justify:
        componentLayout?.switcher?.justify ??
        reflow?.switcherJustify ??
        defaultGlobalLayoutProfile.reflow.switcherJustify,
    },
    frame: {
      maxWidth:
        componentLayout?.frame?.maxWidth ??
        frame?.frameMaxWidth ??
        defaultGlobalLayoutProfile.frame.frameMaxWidth,
      measure: componentLayout?.frame?.measure ?? "full",
    },
  }
}

function inferMeasureFromFrameMaxWidth(
  maxWidth: string,
  measure: Partial<GlobalLayoutProfile["measure"]> | undefined,
): LayoutMeasureToken {
  if (maxWidth === (measure?.prose ?? defaultGlobalLayoutProfile.measure.prose)) {
    return "prose"
  }

  if (maxWidth === (measure?.full ?? defaultGlobalLayoutProfile.measure.full)) {
    return "full"
  }

  return "wide"
}

function resolveBuiltinRenderConfig(
  artifactProfileReference: ArtifactProfileReference,
) {
  if (!isBuiltinArtifactProfileReference(artifactProfileReference)) {
    return undefined
  }

  return resolveResolvedArtifactProfileConfig(artifactProfileReference)
}

function resolveDefaultRenderConfig(
  options: ParseRenderConfigOptions,
): RenderConfig {
  const defaultArtifactProfile =
    options.resolveDefaultArtifactProfileReference?.()

  if (defaultArtifactProfile) {
    return createRenderConfigFromArtifactProfile(defaultArtifactProfile)
  }

  return DEFAULT_RENDER_CONFIG
}

function isBuiltinArtifactProfileReference(
  artifactProfileReference: ArtifactProfileReference,
): artifactProfileReference is BuiltinArtifactProfileReference {
  return PUBLIC_ARTIFACT_PROFILE_REFERENCE_VALUES.includes(
    artifactProfileReference as BuiltinArtifactProfileReference,
  )
}

function resolveResolvedArtifactProfileConfig(
  artifactProfileReference: BuiltinArtifactProfileReference,
): RenderConfig {
  return resolvedRenderConfigsByReference[artifactProfileReference]
}

function createArtifactProfile(
  id: BuiltinArtifactProfileReference,
): ArtifactProfile {
  return {
    id,
    globalStyle: createGlobalStyleProfile(),
    globalLayout: createGlobalLayoutProfile(),
    componentStyle: createComponentStyleProfile(id),
    componentLayout: createComponentLayoutProfile(),
  }
}

function createComponentStyleProfile(
  _id: BuiltinArtifactProfileReference,
): ComponentStyleProfile {
  return {}
}

function createGlobalStyleProfile(): GlobalStyleProfile {
  return {
    tokenSets: {
      light: { ...neutralLightSemanticTokens },
      dark: { ...neutralDarkSemanticTokens },
    },
    radiusScale: { ...defaultRadiusScale },
    typography: { ...defaultTypographyProfile },
    cssVariableMap: { ...defaultCssVariableMap },
  }
}

function createGlobalLayoutProfile(): GlobalLayoutProfile {
  return {
    frame: { ...defaultGlobalLayoutProfile.frame },
    measure: { ...defaultGlobalLayoutProfile.measure },
    rhythm: { ...defaultGlobalLayoutProfile.rhythm },
    density: { ...defaultGlobalLayoutProfile.density },
    partition: { ...defaultGlobalLayoutProfile.partition },
    reflow: { ...defaultGlobalLayoutProfile.reflow },
  }
}

function createComponentLayoutProfile(): ComponentLayoutProfile {
  return normalizeComponentLayoutProfile(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  )
}
