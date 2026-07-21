import {
  CaseSensitiveIcon,
  CircleIcon,
  PaletteIcon,
  Rows3Icon,
  SquareDashedBottomCodeIcon,
} from "lucide-react"
import type * as React from "react"
import type { HostMessageKey } from "../i18n/messages"
import type { CanvasThemeEditorSectionId } from "./theme-editor-contract"

export type { CanvasThemeEditorSectionId } from "./theme-editor-contract"

export const canvasThemeEditorSections = [
  {
    icon: PaletteIcon,
    id: "color",
    labelKey: "theme.color",
  },
  {
    icon: CaseSensitiveIcon,
    id: "typography",
    labelKey: "theme.typography",
  },
  {
    icon: CircleIcon,
    id: "radius",
    labelKey: "theme.radius",
  },
  {
    icon: Rows3Icon,
    id: "spacing",
    labelKey: "theme.spacing",
  },
  {
    icon: SquareDashedBottomCodeIcon,
    id: "canvas",
    labelKey: "theme.canvas",
  },
] as const satisfies readonly {
  icon: React.ComponentType<{ className?: string }>
  id: CanvasThemeEditorSectionId
  labelKey: HostMessageKey
}[]
