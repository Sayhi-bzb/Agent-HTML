import {
  CaseSensitiveIcon,
  CircleIcon,
  PaletteIcon,
  Rows3Icon,
  SquareDashedBottomCodeIcon,
} from "lucide-react"
import type * as React from "react"

export type CanvasThemeEditorSectionId =
  | "color"
  | "typography"
  | "radius"
  | "spacing"
  | "canvas"

export const canvasThemeEditorSections = [
  {
    icon: PaletteIcon,
    id: "color",
    label: "Color",
  },
  {
    icon: CaseSensitiveIcon,
    id: "typography",
    label: "Typography",
  },
  {
    icon: CircleIcon,
    id: "radius",
    label: "Radius",
  },
  {
    icon: Rows3Icon,
    id: "spacing",
    label: "Spacing",
  },
  {
    icon: SquareDashedBottomCodeIcon,
    id: "canvas",
    label: "Canvas",
  },
] as const satisfies readonly {
  icon: React.ComponentType<{ className?: string }>
  id: CanvasThemeEditorSectionId
  label: string
}[]
