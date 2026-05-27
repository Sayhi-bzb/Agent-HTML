import type { GalleryScene } from "@/app/gallery/types"

export const galleryScenes: GalleryScene[] = [
  {
    id: "overview",
    label: "Overview",
    title: "Gallery overview board",
    summary:
      "A broad scene that frames the shell, workspace, and composition principles together.",
    description:
      "Use this view to compare overall tone, shell continuity, and how the inset workspace sits inside the operating frame.",
  },
  {
    id: "shell-study",
    label: "Shell Study",
    title: "Shell continuity study",
    summary:
      "A scene focused on header, sidebar, footer rhythm, and how the shell reads as one plane.",
    description:
      "Use this view to inspect whether the shell reads as a single operating plane without hard separators or accidental emphasis shifts.",
  },
  {
    id: "workspace-study",
    label: "Workspace Study",
    title: "Inset workspace study",
    summary:
      "A scene focused on the lighter embedded workspace surface and nested content hierarchy.",
    description:
      "Use this view to reason about card depth, working-surface contrast, and how content settles inside the inset frame.",
  },
  {
    id: "reference-detail",
    label: "Reference Detail",
    title: "Reference detail board",
    summary:
      "A scene dedicated to individual design references, annotations, and extracted takeaways.",
    description:
      "Use this view to inspect a smaller set of references in more detail and capture the decisions they imply for the shell.",
  },
  {
    id: "agent-event-lab",
    label: "Agent Event Lab",
    title: "Agent event behavior lab",
    summary:
      "A controlled scene for testing how Pet, block markers, and the full Drawer divide one turn across different surfaces.",
    description:
      "Use this view to simulate block edits, streaming responses, approvals, and failures without touching the production workspace path.",
  },
]
