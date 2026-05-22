import type { GalleryScene } from "@/gallery/types"

export const gallerySceneBoards: Record<
  GalleryScene["id"],
  Array<{
    eyebrow: string
    summary: string
    title: string
  }>
> = {
  overview: [
    {
      eyebrow: "Direction 01",
      title: "Continuous shell / soft inset",
      summary:
        "A quiet operating frame that lets the workspace read as a drafting substrate rather than a second shell.",
    },
    {
      eyebrow: "Direction 02",
      title: "Plane-first layout / no separators",
      summary:
        "A flatter shell that relies on adjacency, tone, and rounding instead of line-based segmentation.",
    },
    {
      eyebrow: "Direction 03",
      title: "Stable header / scene-swapped body",
      summary:
        "A model where the window header carries mode-specific scenes while the rest of the shell stays coherent.",
    },
  ],
  "reference-detail": [
    {
      eyebrow: "Reference",
      title: "Mode-switch without route-switch",
      summary:
        "A pattern where global context remains stable while the main operating surface changes role completely.",
    },
    {
      eyebrow: "Reference",
      title: "Single-plane shell continuity",
      summary:
        "A shell philosophy that avoids divider-heavy layouts and prefers background continuity over explicit framing.",
    },
    {
      eyebrow: "Reference",
      title: "Embedded workspace surfaces",
      summary:
        "An inset content plane that feels intentionally hosted by the shell instead of visually detached from it.",
    },
  ],
  "shell-study": [
    {
      eyebrow: "Shell",
      title: "Window header as scene rail",
      summary:
        "Scene tabs live in the window header so the gallery reads as an operating mode rather than a nested page.",
    },
    {
      eyebrow: "Shell",
      title: "Back-led sidebar header",
      summary:
        "The sidebar header becomes a directional control while the body stabilizes as an editor surface.",
    },
    {
      eyebrow: "Shell",
      title: "Footer as utility band",
      summary:
        "Gallery footer stays passive and informational so the focus remains on scenes rather than submission.",
    },
  ],
  "workspace-study": [
    {
      eyebrow: "Workspace",
      title: "Inset composition",
      summary:
        "The main area is lighter, inset, and rounded so it reads as a working substrate inside a darker frame.",
    },
    {
      eyebrow: "Workspace",
      title: "Nested surface hierarchy",
      summary:
        "Cards should sit one level below the work surface instead of repeating shell contrast.",
    },
    {
      eyebrow: "Workspace",
      title: "Reading-first content plane",
      summary:
        "Content density stays legible even when the shell itself feels visually compact and continuous.",
    },
  ],
}
