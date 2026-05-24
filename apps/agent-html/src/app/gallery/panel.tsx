import type { GalleryColorTokenValues } from "@/app/gallery/editor-panels"
import type { GalleryScene } from "@/app/gallery/types"
import { GalleryWorkspaceSurface } from "@/app/gallery/workspace-surface"
import { ScrollArea } from "@/shared/ui/scroll-area"

export function GalleryPanel({
  colorTokenValues,
  scene: _scene,
}: {
  colorTokenValues: GalleryColorTokenValues
  scene: GalleryScene
}) {
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col p-4 md:p-6">
          <GalleryWorkspaceSurface colorTokenValues={colorTokenValues} />
        </div>
      </ScrollArea>
    </div>
  )
}
