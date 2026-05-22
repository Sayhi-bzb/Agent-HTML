import {
  BookImageIcon,
  CompassIcon,
  PanelsTopLeftIcon,
  SparklesIcon,
  SwatchBookIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"

export type GallerySection = "editor" | "notes" | "inspect"

export type GalleryScene = {
  description: string
  id: string
  label: string
  summary: string
  title: string
}

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
]

const sectionMeta: Record<
  GallerySection,
  {
    description: string
    icon: typeof SparklesIcon
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

const editorPanels = [
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

const sceneBoards: Record<
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

function GalleryBoard({ scene }: { scene: GalleryScene }) {
  const cards = sceneBoards[scene.id]

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.title}
            className="rounded-xl border bg-background p-5 text-foreground"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              {card.eyebrow}
            </p>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {card.summary}
            </p>
          </article>
        ))}
      </div>

      <aside className="rounded-xl border bg-background p-5 text-foreground">
        <p className="text-sm font-medium">Scene notes</p>
        <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
          <p>
            `Gallery` owns the header tabs while active. Scene switching changes
            only the work area.
          </p>
          <p>
            The sidebar stays persistent so it can evolve into the editor area
            without reflowing on every subview change.
          </p>
          <p>{scene.description}</p>
        </div>
      </aside>
    </div>
  )
}

function GalleryPreview({ scene }: { scene: GalleryScene }) {
  const isShellScene = scene.id === "shell-study"
  const isWorkspaceScene = scene.id === "workspace-study"
  const isReferenceScene = scene.id === "reference-detail"

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-neutral-950 dark:border-white/10 dark:bg-neutral-950 dark:text-neutral-50">
      <div className="rounded-xl bg-neutral-100 p-3 dark:bg-neutral-900">
        <div className="flex items-center gap-2 text-sm opacity-70">
          <div className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500" />
          <div className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500" />
          <div className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500" />
          <span className="ml-2">Gallery stage</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-[15rem_1fr]">
          <div className="rounded-xl bg-neutral-100 p-4 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
            <div className="mb-4 text-xs uppercase tracking-[0.18em] opacity-60">
              Sidebar editor
            </div>
            <div className="space-y-2">
              {["Editor", "Notes", "Inspect"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-neutral-800"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[1.25rem] bg-white p-5 text-neutral-950 dark:bg-neutral-800 dark:text-neutral-50">
            <div className="mb-5">
              <div className="text-xs uppercase tracking-[0.18em] opacity-60">
                Work area
              </div>
              <div className="mt-2 text-xl font-semibold">{scene.title}</div>
              <div className="mt-1 text-sm opacity-70">{scene.summary}</div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                isReferenceScene ? "Reference" : isShellScene ? "Header" : "Overview",
                isWorkspaceScene ? "Inset surface" : "Shell",
                "Content",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-white/10 dark:bg-neutral-900"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function GallerySidebarPanels({
  section,
}: {
  section: GallerySection
}) {
  const meta = sectionMeta[section]
  const Icon = meta.icon

  return (
    <div className="flex flex-1 flex-col gap-4 px-2 py-2">
      <div className="rounded-xl border bg-sidebar-accent/30 p-4 text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <Icon className="size-4" />
          <p className="text-sm font-medium">{meta.label}</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-sidebar-foreground/70">
          {meta.description}
        </p>
      </div>

      <div className="space-y-3">
        {editorPanels.map((panel) => (
          <article
            key={panel.title}
            className="rounded-xl border border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground"
          >
            <p className="text-sm font-medium">{panel.title}</p>
            <p className="mt-1 text-sm leading-6 text-sidebar-foreground/70">
              {panel.summary}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}

export function GalleryPanel({
  scene,
}: {
  scene: GalleryScene
}) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b px-4 py-5 md:px-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">System view</p>
          <div className="flex items-center gap-2">
            <CompassIcon className="size-4 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Header tabs now drive preview scenes while the sidebar remains a
            stable editor area.
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <GalleryBoard scene={scene} />

        <section className="rounded-xl border bg-background p-5 text-foreground">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Stage preview</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The active gallery scene controls only this work area.
              </p>
            </div>
            <Button size="sm" type="button" variant="outline">
              <CompassIcon className="size-4" />
              {scene.label}
            </Button>
          </div>

          <div className="mt-5">
            <GalleryPreview scene={scene} />
          </div>
        </section>
      </div>
    </div>
  )
}
