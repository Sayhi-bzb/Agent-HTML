import type { GalleryScene } from "@/gallery/types"

export type GalleryWorkspacePreviewMode =
  | "overview"
  | "shell"
  | "workspace"
  | "detail"

export type GalleryWorkspacePreviewModel = {
  mode: GalleryWorkspacePreviewMode
  stageLabel: string
  stageSummary: string
  tags: string[]
}

export const galleryWorkspacePreviewContent: Record<
  GalleryScene["id"],
  GalleryWorkspacePreviewModel
> = {
  overview: {
    mode: "overview",
    stageLabel: "Official example blend",
    stageSummary:
      "A single preview surface composed from official shadcn examples so Gallery reads like a real component lab instead of a placeholder board.",
    tags: ["Card", "Chart", "Table", "ScrollArea"],
  },
  "reference-detail": {
    mode: "detail",
    stageLabel: "Component inspection detail",
    stageSummary:
      "A denser preview pass that foregrounds table behavior and smaller component interactions while keeping the same hosted work surface.",
    tags: ["Detail", "Select", "Input", "Review"],
  },
  "shell-study": {
    mode: "shell",
    stageLabel: "Shell-safe preview chrome",
    stageSummary:
      "A preview layout that keeps local chrome light so the app shell remains dominant while real components still fill the work area.",
    tags: ["Quiet chrome", "Nested cards", "Hosted scene"],
  },
  "workspace-study": {
    mode: "workspace",
    stageLabel: "Inset workspace density",
    stageSummary:
      "A work-surface-first composition that leans on charts, cards, and tables to validate hierarchy inside the lighter inset canvas.",
    tags: ["Inset surface", "Chart", "Data table", "Density"],
  },
}
