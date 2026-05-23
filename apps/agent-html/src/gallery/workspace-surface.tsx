import { GalleryWorkspacePreview } from "@/gallery/preview/workspace-preview"
import type { GalleryColorTokenValues } from "@/gallery/editor-panels"

export function GalleryWorkspaceSurface({
  colorTokenValues,
}: {
  colorTokenValues: GalleryColorTokenValues
}) {
  return <GalleryWorkspacePreview colorTokenValues={colorTokenValues} />
}
