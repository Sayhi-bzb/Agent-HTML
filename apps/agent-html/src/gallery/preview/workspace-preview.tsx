import * as React from "react"
import colors from "tailwindcss/colors"

import type {
  GalleryColorFamily,
  GalleryColorStep,
  GalleryColorTokenValues,
} from "@/gallery/editor-panels"
import {
  galleryTypographyDefaults,
  resolveGalleryTypographyFontFamily,
} from "@/gallery/typography"
import { galleryPreviewDefaults } from "@/gallery/preview-defaults"
import { PreviewMasonry } from "@/gallery/preview/masonry"
import { galleryPreviewCards } from "@/gallery/preview"

type TailwindColorScale = Record<GalleryColorStep, string>

const tailwindColorFamilies = Object.fromEntries(
  (Object.keys(colors) as GalleryColorFamily[]).map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<GalleryColorFamily, TailwindColorScale>

function GalleryViewport() {
  return <PreviewMasonry cards={galleryPreviewCards} />
}

export function GalleryWorkspacePreview({
  colorTokenValues,
}: {
  colorTokenValues: GalleryColorTokenValues
}) {
  const previewThemeStyle = React.useMemo(() => {
    const resolveColor = (tokenName: keyof GalleryColorTokenValues) => {
      const token = colorTokenValues[tokenName]
      return (
        tailwindColorFamilies[token.family]?.[token.step] ??
        tailwindColorFamilies.zinc[500]
      )
    }

    const fontFamily = resolveGalleryTypographyFontFamily(
      galleryTypographyDefaults.fontFamily
    )

    return {
      "--background": resolveColor("background"),
      "--foreground": resolveColor("foreground"),
      "--card": resolveColor("card"),
      "--card-foreground": resolveColor("card-foreground"),
      "--popover": resolveColor("popover"),
      "--popover-foreground": resolveColor("popover-foreground"),
      "--primary": resolveColor("primary"),
      "--primary-foreground": resolveColor("primary-foreground"),
      "--secondary": resolveColor("secondary"),
      "--secondary-foreground": resolveColor("secondary-foreground"),
      "--accent": resolveColor("accent"),
      "--accent-foreground": resolveColor("accent-foreground"),
      "--destructive": resolveColor("destructive"),
      "--muted": resolveColor("muted"),
      "--muted-foreground": resolveColor("muted-foreground"),
      "--border": resolveColor("border"),
      "--input": resolveColor("input"),
      "--ring": resolveColor("ring"),
      "--font-sans": fontFamily,
      "--font-heading": fontFamily,
      "--radius": galleryPreviewDefaults.radius,
      "--preview-card-shadow":
        "0 18px 36px -22px color-mix(in oklab, var(--foreground) 38%, transparent)",
      "--spacing-base": galleryPreviewDefaults.spacing,
      "--space-1": "calc(var(--spacing-base) * 0.75)",
      "--space-2": "var(--spacing-base)",
      "--space-3": "calc(var(--spacing-base) * 1.25)",
      "--space-4": "calc(var(--spacing-base) * 1.5)",
      "--type-base-size": galleryTypographyDefaults.baseSize,
      "--type-base-line-height": galleryTypographyDefaults.lineHeight,
      "--type-xs": "calc(var(--type-base-size) * 0.8125)",
      "--type-sm": "calc(var(--type-base-size) * 0.9375)",
      "--type-md": "var(--type-base-size)",
      "--type-lg": "calc(var(--type-base-size) * 1.125)",
      "--type-xl": "calc(var(--type-base-size) * 1.375)",
      "--type-2xl": "calc(var(--type-base-size) * 1.875)",
    } as React.CSSProperties
  }, [colorTokenValues])

  return (
    <div
      className="overflow-hidden rounded-[calc(var(--radius)*2.4)]"
      style={previewThemeStyle}
    >
      <GalleryViewport />
    </div>
  )
}
