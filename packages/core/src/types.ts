export type ComponentPropValueKind =
  | "boolean"
  | "enum"
  | "number"
  | "string"
  | "text"

export type ComponentPropSchema = {
  readonly name: string
  readonly valueKind: ComponentPropValueKind
  readonly required?: boolean
  readonly description?: string
  readonly enumValues?: readonly string[]
}

export type ComponentSchema = {
  readonly name: string
  readonly description: string
  readonly props: readonly ComponentPropSchema[]
  readonly allowedChildren?: readonly string[]
}

export type PropExposureState = "blocked" | "raw-candidate"

export type SemanticPropOrigin = "content" | "structure"

export type ComponentSemanticPropSchema = ComponentPropSchema & {
  readonly origin?: SemanticPropOrigin
}

export type ComponentSemanticContract = {
  readonly name: string
  readonly description: string
  readonly expose: boolean
  readonly sourceComponents: readonly string[]
  readonly semanticProps?: readonly ComponentSemanticPropSchema[]
  readonly allowedChildren?: readonly string[]
}

export type ComponentExposurePolicy = {
  readonly component: string
  readonly blocked?: readonly string[]
  readonly rawCandidates?: readonly string[]
  readonly openedRawCandidates?: readonly string[]
  readonly lockedRawCandidates?: readonly string[]
}

export type ResolvedRawPropSchema = ComponentPropSchema & {
  readonly exposureState: PropExposureState
  readonly exposed: boolean
}

export type ResolvedComponentSchema = ComponentSchema & {
  readonly semanticProps: readonly ComponentSemanticPropSchema[]
  readonly rawCandidateProps?: readonly ResolvedRawPropSchema[]
  readonly exposedRawProps?: readonly ComponentPropSchema[]
  readonly blockedPropNames?: readonly string[]
}

export type ComponentSchemaOverlay = {
  readonly name: string
  readonly description: string
  readonly expose: boolean
  readonly sourceComponents: readonly string[]
  readonly props?: readonly ComponentPropSchema[]
  readonly allowedChildren?: readonly string[]
  readonly hiddenProps?: readonly string[]
}

export type GeneratedShadcnIntrospection = {
  readonly registryName: string
  readonly componentName: string
  readonly exports: readonly string[]
  readonly slots: readonly string[]
  readonly variantProps?: Readonly<Record<string, readonly string[]>>
  readonly unionProps?: Readonly<Record<string, readonly string[]>>
  readonly blockedProps: readonly string[]
  readonly dependencies?: readonly string[]
  readonly registryDependencies?: readonly string[]
}

export type BuiltinArtifactProfileReference =
  | "report-default"
  | "ops-compact"
  | "review-dense"

export type ArtifactProfileReference = string

export type SemanticColorTokenSet = {
  readonly background: string
  readonly foreground: string
  readonly card: string
  readonly cardForeground: string
  readonly popover: string
  readonly popoverForeground: string
  readonly primary: string
  readonly primaryForeground: string
  readonly secondary: string
  readonly secondaryForeground: string
  readonly muted: string
  readonly mutedForeground: string
  readonly accent: string
  readonly accentForeground: string
  readonly destructive: string
  readonly destructiveForeground: string
  readonly border: string
  readonly input: string
  readonly ring: string
  readonly chart1: string
  readonly chart2: string
  readonly chart3: string
  readonly chart4: string
  readonly chart5: string
  readonly sidebar: string
  readonly sidebarForeground: string
  readonly sidebarPrimary: string
  readonly sidebarPrimaryForeground: string
  readonly sidebarAccent: string
  readonly sidebarAccentForeground: string
  readonly sidebarBorder: string
  readonly sidebarRing: string
}

export type GlobalStyleTokenSets = {
  readonly light: SemanticColorTokenSet
  readonly dark: SemanticColorTokenSet
}

export type RadiusScale = {
  readonly base: string
  readonly sm: string
  readonly md: string
  readonly lg: string
  readonly xl: string
  readonly "2xl": string
  readonly "3xl": string
  readonly "4xl": string
}

export type TypographyProfile = {
  readonly fontSans: string
  readonly fontHeading: string
  readonly fontSerif: string
  readonly fontMono: string
  readonly letterSpacing: string
  readonly spacing: string
  readonly shadowColor: string
  readonly shadowOpacity: string
  readonly shadowBlur: string
  readonly shadowSpread: string
  readonly shadowOffsetX: string
  readonly shadowOffsetY: string
}

export type CssVariableMap = {
  readonly background: "--background"
  readonly foreground: "--foreground"
  readonly card: "--card"
  readonly cardForeground: "--card-foreground"
  readonly popover: "--popover"
  readonly popoverForeground: "--popover-foreground"
  readonly primary: "--primary"
  readonly primaryForeground: "--primary-foreground"
  readonly secondary: "--secondary"
  readonly secondaryForeground: "--secondary-foreground"
  readonly muted: "--muted"
  readonly mutedForeground: "--muted-foreground"
  readonly accent: "--accent"
  readonly accentForeground: "--accent-foreground"
  readonly destructive: "--destructive"
  readonly destructiveForeground: "--destructive-foreground"
  readonly border: "--border"
  readonly input: "--input"
  readonly ring: "--ring"
  readonly chart1: "--chart-1"
  readonly chart2: "--chart-2"
  readonly chart3: "--chart-3"
  readonly chart4: "--chart-4"
  readonly chart5: "--chart-5"
  readonly sidebar: "--sidebar"
  readonly sidebarForeground: "--sidebar-foreground"
  readonly sidebarPrimary: "--sidebar-primary"
  readonly sidebarPrimaryForeground: "--sidebar-primary-foreground"
  readonly sidebarAccent: "--sidebar-accent"
  readonly sidebarAccentForeground: "--sidebar-accent-foreground"
  readonly sidebarBorder: "--sidebar-border"
  readonly sidebarRing: "--sidebar-ring"
  readonly radius: "--radius"
  readonly fontSans: "--font-sans"
  readonly fontHeading: "--font-heading"
  readonly fontSerif: "--font-serif"
  readonly fontMono: "--font-mono"
  readonly letterSpacing: "--letter-spacing"
  readonly spacing: "--spacing"
  readonly shadowColor: "--shadow-color"
  readonly shadowOpacity: "--shadow-opacity"
  readonly shadowBlur: "--shadow-blur"
  readonly shadowSpread: "--shadow-spread"
  readonly shadowOffsetX: "--shadow-offset-x"
  readonly shadowOffsetY: "--shadow-offset-y"
}

export type GlobalStyleProfile = {
  readonly tokenSets: GlobalStyleTokenSets
  readonly radiusScale: RadiusScale
  readonly typography: TypographyProfile
  readonly cssVariableMap: CssVariableMap
}

export type ComponentStyleProfile = {
  readonly treatments: Readonly<Record<string, string>>
}

export type DensityPosture = "compact" | "balanced" | "relaxed"

export type LayoutMeasureToken = "prose" | "wide" | "full"

export type LayoutAutoFlow = "auto-fit" | "auto-fill"

export type LayoutWrapMode = "wrap" | "nowrap"

export type LayoutJustifyMode =
  | "flex-start"
  | "center"
  | "space-between"

export type GlobalLayoutProfile = {
  readonly frame: {
    readonly pageMaxWidth: string
    readonly pagePaddingInline: string
    readonly pagePaddingBlockStart: string
    readonly pagePaddingBlockEnd: string
    readonly frameMaxWidth: string
  }
  readonly measure: {
    readonly prose: string
    readonly wide: string
    readonly full: string
  }
  readonly rhythm: {
    readonly pageGap: string
    readonly stackGap: string
    readonly clusterGap: string
    readonly splitGap: string
    readonly gridGap: string
    readonly switcherGap: string
  }
  readonly density: {
    readonly default: DensityPosture
    readonly compact: number
    readonly balanced: number
    readonly relaxed: number
  }
  readonly partition: {
    readonly splitMinColumnWidth: string
    readonly gridMinColumnWidth: string
    readonly switcherMinChildWidth: string
  }
  readonly reflow: {
    readonly splitAutoFlow: LayoutAutoFlow
    readonly gridAutoFlow: LayoutAutoFlow
    readonly clusterWrap: LayoutWrapMode
    readonly switcherWrap: LayoutWrapMode
    readonly clusterJustify: LayoutJustifyMode
    readonly switcherJustify: LayoutJustifyMode
  }
}

export type ComponentLayoutProfile = {
  readonly page: {
    readonly gap: string
    readonly measure: LayoutMeasureToken
  }
  readonly stack: {
    readonly gap: string
    readonly density: DensityPosture
    readonly measure: LayoutMeasureToken
  }
  readonly cluster: {
    readonly gap: string
    readonly density: DensityPosture
    readonly wrap: LayoutWrapMode
    readonly justify: LayoutJustifyMode
  }
  readonly split: {
    readonly gap: string
    readonly density: DensityPosture
    readonly minColumnWidth: string
    readonly autoFlow: LayoutAutoFlow
  }
  readonly grid: {
    readonly gap: string
    readonly density: DensityPosture
    readonly minColumnWidth: string
    readonly autoFlow: LayoutAutoFlow
  }
  readonly switcher: {
    readonly gap: string
    readonly density: DensityPosture
    readonly minChildWidth: string
    readonly wrap: LayoutWrapMode
    readonly justify: LayoutJustifyMode
  }
  readonly frame: {
    readonly maxWidth: string
    readonly measure: LayoutMeasureToken
  }
}

export type ArtifactProfile = {
  readonly id: ArtifactProfileReference
  readonly globalStyle: GlobalStyleProfile
  readonly globalLayout: GlobalLayoutProfile
  readonly componentStyle: ComponentStyleProfile
  readonly componentLayout: ComponentLayoutProfile
}

export type RenderConfig = {
  readonly artifactProfileReference: ArtifactProfileReference
  readonly artifactProfile: ArtifactProfile
}

export type RenderConfigResolutionReason =
  | "explicit-profile-ref"
  | "resolved-custom-profile-ref"
  | "legacy-style-ref"
  | "missing-profile-ref"
  | "invalid-profile-ref-shape"
  | "unknown-profile-ref"

export type ResolvedRenderConfig = {
  readonly config: RenderConfig
  readonly reason: RenderConfigResolutionReason
  readonly requestedProfileRef?: string
}

export type PublicRenderConfigModel = "artifact-profile-reference"

export type PublicRenderConfigContract = {
  readonly defaults: Readonly<Record<string, string>>
  readonly keys: readonly string[]
  readonly values: Readonly<Record<string, readonly string[]>>
  readonly model: PublicRenderConfigModel
}

export type PublicSafetyPolicy = {
  readonly blockedNames: readonly string[]
  readonly forbidden: string
}

export type PublicAgentContract = {
  readonly components: readonly ComponentSchema[]
  readonly renderConfig: PublicRenderConfigContract
  readonly safetyPolicy: PublicSafetyPolicy
  readonly forbidden: string
}

export type SanitizedTextNode = {
  readonly type: "text"
  readonly value: string
}

export type StandardAgentNode = {
  readonly type: "component"
  readonly name: string
  readonly props: Readonly<Record<string, string>>
  readonly children: readonly SanitizedNode[]
}

export type SanitizedNode = StandardAgentNode | SanitizedTextNode

export type SanitizedAgentHtml = {
  readonly meta: RenderConfig
  readonly components: readonly StandardAgentNode[]
}
