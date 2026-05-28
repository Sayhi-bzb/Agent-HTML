export type GalleryViewId = "components" | "pets" | "theme"

export type GalleryView = {
  id: GalleryViewId
  label: string
  summary: string
}

export const galleryViews: GalleryView[] = [
  {
    id: "theme",
    label: "Theme",
    summary: "Edit app theme colors, typography, radius, spacing, and shadows.",
  },
  {
    id: "components",
    label: "Components",
    summary: "Browse reusable component packs for future artifact surfaces.",
  },
  {
    id: "pets",
    label: "Pets",
    summary: "Browse companion assets for future workspace personalization.",
  },
]

export function isGalleryViewId(value: string): value is GalleryViewId {
  return galleryViews.some((view) => view.id === value)
}
