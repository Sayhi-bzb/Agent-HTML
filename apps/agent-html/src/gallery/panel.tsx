import { GalleryWorkspacePreview } from "@/gallery/workspace-preview"
import type { GalleryRadiusValue } from "@/gallery/editor"
import type { GalleryScene } from "@/gallery/types"
import { ScrollArea } from "@/components/ui/scroll-area"

export function GalleryPanel({
  radiusValue = "0.625rem",
  scene: _scene,
}: {
  radiusValue?: GalleryRadiusValue
  scene: GalleryScene
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col p-4 md:p-6">
          <GalleryWorkspacePreview radius={radiusValue} />
        </div>
      </ScrollArea>
    </div>
  )
}
