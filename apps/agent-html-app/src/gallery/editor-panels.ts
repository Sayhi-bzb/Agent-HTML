import { generatedGalleryThemePresets } from "@/app/gallery/theme-presets.generated"

export type ColorRoleGroupItem = {
  id: string
  label: string
  token: string
}

export type ColorRoleGroup = {
  id: string
  label: string
  items: readonly ColorRoleGroupItem[]
}

export const galleryColorFamilies = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "rose",
] as const

export const galleryColorSteps = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const

export type GalleryColorFamily = (typeof galleryColorFamilies)[number]
export type GalleryColorStep = (typeof galleryColorSteps)[number]
export type GalleryColorTokenName =
  (typeof galleryColorRoleGroups)[number]["items"][number]["token"]

export type GalleryColorTokenValue = {
  family: GalleryColorFamily
  step: GalleryColorStep
}

export type GalleryColorTokenValues = Record<
  GalleryColorTokenName,
  GalleryColorTokenValue
>

export const galleryColorRoleGroups: ColorRoleGroup[] = [
  {
    id: "background",
    label: "background",
    items: [
      { id: "background", label: "background", token: "background" },
      { id: "foreground", label: "foreground", token: "foreground" },
    ],
  },
  {
    id: "card",
    label: "card",
    items: [
      { id: "background", label: "background", token: "card" },
      { id: "foreground", label: "foreground", token: "card-foreground" },
    ],
  },
  {
    id: "popover",
    label: "popover",
    items: [
      { id: "background", label: "background", token: "popover" },
      {
        id: "foreground",
        label: "foreground",
        token: "popover-foreground",
      },
    ],
  },
  {
    id: "primary",
    label: "primary",
    items: [
      { id: "background", label: "background", token: "primary" },
      {
        id: "foreground",
        label: "foreground",
        token: "primary-foreground",
      },
    ],
  },
  {
    id: "secondary",
    label: "secondary",
    items: [
      { id: "background", label: "background", token: "secondary" },
      {
        id: "foreground",
        label: "foreground",
        token: "secondary-foreground",
      },
    ],
  },
  {
    id: "accent",
    label: "accent",
    items: [
      { id: "background", label: "background", token: "accent" },
      {
        id: "foreground",
        label: "foreground",
        token: "accent-foreground",
      },
    ],
  },
  {
    id: "muted",
    label: "muted",
    items: [
      { id: "background", label: "background", token: "muted" },
      {
        id: "foreground",
        label: "foreground",
        token: "muted-foreground",
      },
    ],
  },
  {
    id: "destructive",
    label: "destructive",
    items: [{ id: "color", label: "color", token: "destructive" }],
  },
  {
    id: "border",
    label: "border",
    items: [{ id: "color", label: "color", token: "border" }],
  },
  {
    id: "input",
    label: "input",
    items: [{ id: "color", label: "color", token: "input" }],
  },
  {
    id: "ring",
    label: "ring",
    items: [{ id: "color", label: "color", token: "ring" }],
  },
]

export const galleryColorTokenDefaults: GalleryColorTokenValues = {
  background: { family: "zinc", step: "50" },
  foreground: { family: "zinc", step: "900" },
  card: { family: "zinc", step: "50" },
  "card-foreground": { family: "zinc", step: "900" },
  popover: { family: "zinc", step: "50" },
  "popover-foreground": { family: "zinc", step: "900" },
  primary: { family: "zinc", step: "900" },
  "primary-foreground": { family: "zinc", step: "50" },
  secondary: { family: "zinc", step: "100" },
  "secondary-foreground": { family: "zinc", step: "900" },
  accent: { family: "zinc", step: "100" },
  "accent-foreground": { family: "zinc", step: "900" },
  destructive: { family: "red", step: "600" },
  muted: { family: "zinc", step: "100" },
  "muted-foreground": { family: "zinc", step: "500" },
  border: { family: "zinc", step: "200" },
  input: { family: "zinc", step: "200" },
  ring: { family: "zinc", step: "400" },
}

export type GalleryThemeCssVariables = Partial<Record<`--${string}`, string>>

export type GalleryThemePreset = {
  darkCssVariables?: GalleryThemeCssVariables
  id: string
  label: string
  lightCssVariables?: GalleryThemeCssVariables
}

export const galleryThemePresets: readonly GalleryThemePreset[] = [
  {
    id: "default",
    label: "Default",
    lightCssVariables: {},
  },
  ...generatedGalleryThemePresets,
] as const

export type GalleryThemePresetId = (typeof galleryThemePresets)[number]["id"]
