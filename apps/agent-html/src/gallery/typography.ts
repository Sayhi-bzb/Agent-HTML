export const galleryTypographyFontOptions = [
  {
    family: '"Geist Variable", sans-serif',
    id: "geist",
    label: "Geist",
  },
  {
    family: '"Georgia", serif',
    id: "georgia",
    label: "Georgia",
  },
  {
    family: '"Times New Roman", serif',
    id: "times",
    label: "Times",
  },
  {
    family: '"Trebuchet MS", sans-serif',
    id: "trebuchet",
    label: "Trebuchet",
  },
  {
    family: '"Courier New", monospace',
    id: "courier",
    label: "Courier",
  },
] as const

export const galleryTypographyBaseSizeOptions = [
  "0.9375rem",
  "1rem",
  "1.0625rem",
  "1.125rem",
] as const

export const galleryTypographyLineHeightOptions = [
  "1.4",
  "1.5",
  "1.6",
  "1.75",
] as const

export type GalleryTypographyFontId =
  (typeof galleryTypographyFontOptions)[number]["id"]

export type GalleryTypographyBaseSizeValue =
  (typeof galleryTypographyBaseSizeOptions)[number]

export type GalleryTypographyLineHeightValue =
  (typeof galleryTypographyLineHeightOptions)[number]

export type GalleryTypographyValue = {
  baseSize: GalleryTypographyBaseSizeValue
  fontFamily: GalleryTypographyFontId
  lineHeight: GalleryTypographyLineHeightValue
}

export const galleryTypographyDefaults: GalleryTypographyValue = {
  baseSize: "1rem",
  fontFamily: "geist",
  lineHeight: "1.6",
}
