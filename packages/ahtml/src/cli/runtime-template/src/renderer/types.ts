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
    documentStyleConfigReference: string
    styleProfile: {
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
            border: string
            input: string
            ring: string
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
            border: string
            input: string
            ring: string
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
          border: string
          input: string
          ring: string
          radius: string
          fontSans: string
          fontHeading: string
        }
      }
      componentStyle: {
        treatments: Record<string, string>
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

export type RendererLegacyVariantBridge = {
  kind: "variant"
  sourceProp: string
  targetProp: string
  map?: Record<string, RendererPropValue>
  default?: RendererPropValue
}

export type RendererLegacyStateBridge = {
  kind: "state"
  stateKind: "tabs-default" | "accordion-state"
  defaultProp: string
  modeProp?: string
  defaultMode?: string
  multiValueDelimiter?: string
}

export type RendererLegacyStructuralRoleBridge = {
  kind: "structural-role"
  roleKind: "table-row-kind"
  sourceProp: string
  headerValue: string
}

export type RendererLegacyBridgeSet = {
  variant?: RendererLegacyVariantBridge[]
  state?: RendererLegacyStateBridge[]
  structuralRole?: RendererLegacyStructuralRoleBridge[]
}

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
  mode?: string
  itemValueProp?: string
  itemHeadingProp?: string
  valueProp?: string
  controlListAttr?: string
  emptyText?: string
  rootByProp?: RendererRootByProp
  propMappings?: RendererPropMapping[]
  legacyBridges?: RendererLegacyBridgeSet
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
        stateBridge?: string
        multiValueDelimiter?: string
      }
      slots?: RendererSlot[]
    }[]
  }
  rendererMapping: {
    version: number
    components: RendererSpecComponent[]
  }
}
