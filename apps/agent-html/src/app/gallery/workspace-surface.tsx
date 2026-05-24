import { GalleryWorkspacePreview } from "@/app/gallery/preview/workspace-preview"
import type { GalleryColorTokenValues } from "@/app/gallery/editor-panels"

export function GalleryWorkspaceSurface({
  colorTokenValues,
}: {
  colorTokenValues: GalleryColorTokenValues
}) {
  return <GalleryWorkspacePreview colorTokenValues={colorTokenValues} />
}
