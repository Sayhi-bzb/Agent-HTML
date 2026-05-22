import * as React from "react"
import colors from "tailwindcss/colors"

import type {
  GalleryColorFamily,
  GalleryColorStep,
  GalleryColorTokenValues,
} from "@/gallery/editor-panels"
import type { GalleryShadowValue } from "@/gallery/editor"
import {
  galleryTypographyFontOptions,
  type GalleryTypographyValue,
} from "@/gallery/typography"
import { galleryPreviewCards } from "@/gallery/preview"

type TailwindColorScale = Record<GalleryColorStep, string>

const tailwindColorFamilies = Object.fromEntries(
  (Object.keys(colors) as GalleryColorFamily[]).map((family) => [
    family,
    colors[family] as TailwindColorScale,
  ])
) as Record<GalleryColorFamily, TailwindColorScale>

function GalleryMasonryItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-[var(--space-2)] inline-block w-full align-top [break-inside:avoid]">
      {children}
    </div>
  )
}

function GalleryViewport({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      className="columns-1 gap-x-[var(--space-2)] p-[var(--space-2)] md:columns-2"
      style={style}
    >
      {galleryPreviewCards.map((PreviewCard) => (
        <GalleryMasonryItem key={PreviewCard.name}>
          <PreviewCard />
        </GalleryMasonryItem>
      ))}
    </div>
  )
}

export function GalleryWorkspacePreview({
  colorTokenValues,
  radius = "0.625rem",
  shadow = "medium",
  spacing = "1rem",
  typographyValue,
}: {
  colorTokenValues: GalleryColorTokenValues
  radius?: string
  shadow?: GalleryShadowValue
  spacing?: string
  typographyValue: GalleryTypographyValue
}) {
  const previewThemeStyle = React.useMemo(() => {
    const resolveColor = (tokenName: keyof GalleryColorTokenValues) => {
      const token = colorTokenValues[tokenName]
      return (
        tailwindColorFamilies[token.family]?.[token.step] ??
        tailwindColorFamilies.zinc[500]
      )
    }

    const fontFamily =
      galleryTypographyFontOptions.find(
        (font) => font.id === typographyValue.fontFamily
      )?.family ?? galleryTypographyFontOptions[0].family

    const shadowValue =
      shadow === "none"
        ? "none"
        : shadow === "soft"
          ? "0 10px 24px -18px color-mix(in oklab, var(--foreground) 32%, transparent)"
          : shadow === "strong"
            ? "0 26px 48px -24px color-mix(in oklab, var(--foreground) 45%, transparent)"
            : "0 18px 36px -22px color-mix(in oklab, var(--foreground) 38%, transparent)"

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
      "--radius": radius,
      "--preview-card-shadow": shadowValue,
      "--spacing-base": spacing,
      "--space-1": "calc(var(--spacing-base) * 0.75)",
      "--space-2": "var(--spacing-base)",
      "--space-3": "calc(var(--spacing-base) * 1.25)",
      "--space-4": "calc(var(--spacing-base) * 1.5)",
      "--type-base-size": typographyValue.baseSize,
      "--type-base-line-height": typographyValue.lineHeight,
      "--type-xs": "calc(var(--type-base-size) * 0.8125)",
      "--type-sm": "calc(var(--type-base-size) * 0.9375)",
      "--type-md": "var(--type-base-size)",
      "--type-lg": "calc(var(--type-base-size) * 1.125)",
      "--type-xl": "calc(var(--type-base-size) * 1.375)",
      "--type-2xl": "calc(var(--type-base-size) * 1.875)",
    } as React.CSSProperties
  }, [colorTokenValues, radius, shadow, spacing, typographyValue])

  return (
    <div
      className="overflow-hidden rounded-[calc(var(--radius)*2.4)]"
      style={previewThemeStyle}
    >
      <GalleryViewport />
    </div>
  )
}
