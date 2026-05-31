type GalleryTypographyFontId =
  | "courier"
  | "geist"
  | "georgia"
  | "times"
  | "trebuchet"

type GalleryTypographyBaseSizeValue =
  | "0.9375rem"
  | "1rem"
  | "1.0625rem"
  | "1.125rem"

type GalleryTypographyLineHeightValue = "1.4" | "1.5" | "1.6" | "1.75"

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
