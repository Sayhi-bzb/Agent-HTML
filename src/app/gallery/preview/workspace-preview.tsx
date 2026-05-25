import * as React from "react"

import { galleryTypographyDefaults } from "@/app/gallery/typography"
import { galleryPreviewDefaults } from "@/app/gallery/preview-defaults"
import { PreviewMasonry } from "@/app/gallery/preview/masonry"
import { galleryPreviewCards } from "@/app/gallery/preview"

function GalleryViewport() {
  return <PreviewMasonry cards={galleryPreviewCards} />
}

export function GalleryWorkspacePreview() {
  const previewThemeStyle = React.useMemo(() => {
    return {
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
  }, [])

  return (
    <div
      className="overflow-hidden rounded-[calc(var(--radius)*2.4)]"
      style={previewThemeStyle}
    >
      <GalleryViewport />
    </div>
  )
}
