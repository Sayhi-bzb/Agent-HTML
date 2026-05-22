export type ColorRoleGroup = {
  id: string
  label: string
  tokens: string[]
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
export type GalleryColorTokenName = (typeof galleryColorRoleGroups)[number]["tokens"][number]

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
    id: "base-surfaces",
    label: "Base surfaces",
    tokens: [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
    ],
  },
  {
    id: "action-colors",
    label: "Action colors",
    tokens: [
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "accent",
      "accent-foreground",
      "destructive",
    ],
  },
  {
    id: "utility-colors",
    label: "Utility colors",
    tokens: ["muted", "muted-foreground", "border", "input", "ring"],
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
