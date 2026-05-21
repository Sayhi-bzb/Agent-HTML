import type { RendererKind } from "./kinds"

export type AgentTextNode = {
  type: "text"
  value: string
}

export type AgentComponentNode = {
  type: "component"
  name: string
  props: Record<string, string>
  children: AgentNode[]
}

export type AgentNode = AgentTextNode | AgentComponentNode

export type RendererPathSegment = number | string
export type RendererPath = RendererPathSegment[]

export type AgentDocument = {
  meta: {
    artifactProfileReference: string
    artifactProfile: {
      id: string
      globalStyle: {
        tokenSets: {
          light: {
            background: string
            foreground: string
            card: string
            cardForeground: string
            popover: string
            popoverForeground: string
            primary: string
            primaryForeground: string
            secondary: string
            secondaryForeground: string
            muted: string
            mutedForeground: string
            accent: string
            accentForeground: string
            destructive: string
            destructiveForeground: string
            border: string
            input: string
            ring: string
            chart1: string
            chart2: string
            chart3: string
            chart4: string
            chart5: string
            sidebar: string
            sidebarForeground: string
            sidebarPrimary: string
            sidebarPrimaryForeground: string
            sidebarAccent: string
            sidebarAccentForeground: string
            sidebarBorder: string
            sidebarRing: string
          }
          dark: {
            background: string
            foreground: string
            card: string
            cardForeground: string
            popover: string
            popoverForeground: string
            primary: string
            primaryForeground: string
            secondary: string
            secondaryForeground: string
            muted: string
            mutedForeground: string
            accent: string
            accentForeground: string
            destructive: string
            destructiveForeground: string
            border: string
            input: string
            ring: string
            chart1: string
            chart2: string
            chart3: string
            chart4: string
            chart5: string
            sidebar: string
            sidebarForeground: string
            sidebarPrimary: string
            sidebarPrimaryForeground: string
            sidebarAccent: string
            sidebarAccentForeground: string
            sidebarBorder: string
            sidebarRing: string
          }
        }
        radiusScale: {
          base: string
          sm: string
          md: string
          lg: string
          xl: string
          "2xl": string
          "3xl": string
          "4xl": string
        }
        typography: {
          fontSans: string
          fontHeading: string
          fontSerif: string
          fontMono: string
          letterSpacing: string
          spacing: string
          shadowColor: string
          shadowOpacity: string
          shadowBlur: string
          shadowSpread: string
          shadowOffsetX: string
          shadowOffsetY: string
        }
        cssVariableMap: {
          background: string
          foreground: string
          card: string
          cardForeground: string
          popover: string
          popoverForeground: string
          primary: string
          primaryForeground: string
          secondary: string
          secondaryForeground: string
          muted: string
          mutedForeground: string
          accent: string
          accentForeground: string
          destructive: string
          destructiveForeground: string
          border: string
          input: string
          ring: string
          chart1: string
          chart2: string
          chart3: string
          chart4: string
          chart5: string
          sidebar: string
          sidebarForeground: string
          sidebarPrimary: string
          sidebarPrimaryForeground: string
          sidebarAccent: string
          sidebarAccentForeground: string
          sidebarBorder: string
          sidebarRing: string
          radius: string
          fontSans: string
          fontHeading: string
          fontSerif: string
          fontMono: string
          letterSpacing: string
          spacing: string
          shadowColor: string
          shadowOpacity: string
          shadowBlur: string
          shadowSpread: string
          shadowOffsetX: string
          shadowOffsetY: string
        }
      }
      globalLayout: {
        frame: {
          pageMaxWidth: string
          pagePaddingInline: string
          pagePaddingBlockStart: string
          pagePaddingBlockEnd: string
          frameMaxWidth: string
        }
        measure: {
          prose: string
          wide: string
          full: string
        }
        rhythm: {
          pageGap: string
          stackGap: string
          clusterGap: string
          splitGap: string
          gridGap: string
          switcherGap: string
        }
        density: {
          default: "compact" | "balanced" | "relaxed"
          compact: number
          balanced: number
          relaxed: number
        }
        partition: {
          splitMinColumnWidth: string
          gridMinColumnWidth: string
          switcherMinChildWidth: string
        }
        reflow: {
          splitAutoFlow: "auto-fit" | "auto-fill"
          gridAutoFlow: "auto-fit" | "auto-fill"
          clusterWrap: "wrap" | "nowrap"
          switcherWrap: "wrap" | "nowrap"
          clusterJustify: "flex-start" | "center" | "space-between"
          switcherJustify: "flex-start" | "center" | "space-between"
        }
      }
      componentStyle: {
        treatments: Record<string, string>
      }
      componentLayout: {
        page: {
          gap: string
          measure: "prose" | "wide" | "full"
        }
        stack: {
          gap: string
          density: "compact" | "balanced" | "relaxed"
          measure: "prose" | "wide" | "full"
        }
        cluster: {
          gap: string
          density: "compact" | "balanced" | "relaxed"
          wrap: "wrap" | "nowrap"
          justify: "flex-start" | "center" | "space-between"
        }
        split: {
          gap: string
          density: "compact" | "balanced" | "relaxed"
          minColumnWidth: string
          autoFlow: "auto-fit" | "auto-fill"
        }
        grid: {
          gap: string
          density: "compact" | "balanced" | "relaxed"
          minColumnWidth: string
          autoFlow: "auto-fit" | "auto-fill"
        }
        switcher: {
          gap: string
          density: "compact" | "balanced" | "relaxed"
          minChildWidth: string
          wrap: "wrap" | "nowrap"
          justify: "flex-start" | "center" | "space-between"
        }
        frame: {
          maxWidth: string
          measure: "prose" | "wide" | "full"
        }
      }
    }
  }
  components: AgentNode[]
}

export type RendererSlot = {
  name: string
  children?: string[]
  childNames?: string[]
}

export type RendererPropValue = string | number | boolean | number[]

export type RendererPropMapping = {
  prop: string
  target: string
  map?: Record<string, RendererPropValue>
  default?: RendererPropValue
  coerce?: "boolean" | "number" | "number-array"
}

export type RendererRootByProp = {
  prop: string
  target: "tag"
  map: Record<string, string>
  default: string
}

export type RendererTextMode = "prose" | "preformatted"

export type RendererSpecComponent = {
  name: string
  source?: string
  kind: RendererKind | "structural"
  renderKind: string
  requiredRegistryModules?: {
    registryItem: string
    exports: string[]
  }[]
  requiredRegistryItem?: string
  requiredExports?: string[]
  slots: RendererSlot[]
  childMode?: "block" | "inline" | "none"
  textMode?: RendererTextMode
  component?: string
  control?: string
  controlRoot?: string
  controlContent?: string
  controlEmpty?: string
  controlList?: string
  controlTrigger?: string
  controlValue?: string
  label?: string
  description?: string
  root?: string
  title?: string
  titleContainer?: string
  content?: string
  list?: string
  trigger?: string
  body?: string
  header?: string
  row?: string
  headerCell?: string
  bodyCell?: string
  item?: string
  itemContainer?: string
  itemSlot?: string
  rowSlot?: string
  cellSlot?: string
  rootClassName?: string
  labelClassName?: string
  descriptionClassName?: string
  titleClassName?: string
  labelProp?: string
  descriptionProp?: string
  titleProp?: string
  fallback?: boolean
  itemValueProp?: string
  itemHeadingProp?: string
  valueProp?: string
  controlListAttr?: string
  emptyText?: string
  rootByProp?: RendererRootByProp
  propMappings?: RendererPropMapping[]
  staticProps?: Record<string, RendererPropValue>
}

export type RuntimeVerificationState = {
  verificationData: {
    components: {
      name: string
      renderKind?: string
      behavior?: {
        model: string
        runtimeOwner: string
        forwardedProps?: string[]
        visualStateProp?: string
      }
      slots?: RendererSlot[]
    }[]
  }
  rendererMapping: {
    version: number
    components: RendererSpecComponent[]
  }
}
