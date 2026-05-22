import { GalleryWorkspacePreview } from "@/gallery/preview/workspace-preview"
import type {
  GalleryRadiusValue,
  GalleryShadowValue,
  GallerySpacingValue,
} from "@/gallery/editor"
import type { GalleryColorTokenValues } from "@/gallery/editor-panels"
import type { GalleryTypographyValue } from "@/gallery/typography"
import type { GalleryScene } from "@/gallery/types"
import { ScrollArea } from "@/components/ui/scroll-area"

export function GalleryPanel({
  colorTokenValues,
  radiusValue = "0.625rem",
  shadowValue = "medium",
  spacingValue = "1rem",
  scene: _scene,
  typographyValue,
}: {
  colorTokenValues: GalleryColorTokenValues
  radiusValue?: GalleryRadiusValue
  shadowValue?: GalleryShadowValue
  spacingValue?: GallerySpacingValue
  scene: GalleryScene
  typographyValue: GalleryTypographyValue
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col p-4 md:p-6">
          <GalleryWorkspacePreview
            colorTokenValues={colorTokenValues}
            radius={radiusValue}
            shadow={shadowValue}
            spacing={spacingValue}
            typographyValue={typographyValue}
          />
        </div>
      </ScrollArea>
    </div>
  )
}
