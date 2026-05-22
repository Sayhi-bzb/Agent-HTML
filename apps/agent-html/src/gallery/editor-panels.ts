import {
  BookImageIcon,
  PanelsTopLeftIcon,
  SwatchBookIcon,
} from "lucide-react"

import type { GallerySection } from "@/gallery/types"

export const galleryEditorSections: Array<{
  icon: React.ComponentType<React.ComponentProps<"svg">>
  id: GallerySection
  label: string
}> = [
  { id: "editor", label: "Editor", icon: SwatchBookIcon },
  { id: "notes", label: "Notes", icon: BookImageIcon },
  { id: "inspect", label: "Inspect", icon: PanelsTopLeftIcon },
]

export const gallerySectionMeta: Record<
  GallerySection,
  {
    description: string
    icon: typeof SwatchBookIcon
    label: string
  }
> = {
  editor: {
    description: "Persistent editor controls for the active gallery scene.",
    icon: SwatchBookIcon,
    label: "Editor",
  },
  inspect: {
    description: "Inspection aids and structural notes for the active scene.",
    icon: PanelsTopLeftIcon,
    label: "Inspect",
  },
  notes: {
    description: "Reasoning notes, decisions, and reference framing for the active scene.",
    icon: BookImageIcon,
    label: "Notes",
  },
}

export const galleryEditorPanels = [
  {
    title: "Shell tone",
    summary: "Track how dark the shell reads relative to the inset workspace.",
  },
  {
    title: "Inset depth",
    summary: "Track how embedded the workspace feels without relying on shadow.",
  },
  {
    title: "Reading rhythm",
    summary: "Track spacing, density, and whether the scene keeps scanning easy.",
  },
]
