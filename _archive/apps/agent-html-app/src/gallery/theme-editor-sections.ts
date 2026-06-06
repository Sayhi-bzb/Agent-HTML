import {
  CaseSensitiveIcon,
  CircleIcon,
  PaletteIcon,
  Rows3Icon,
  SunMediumIcon,
} from "lucide-react"

export type GalleryThemeEditorSectionId =
  | "color"
  | "typography"
  | "radius"
  | "spacing"
  | "shadow"

export const galleryThemeEditorSections = [
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
    icon: SunMediumIcon,
    id: "shadow",
    label: "Shadow",
  },
] as const
