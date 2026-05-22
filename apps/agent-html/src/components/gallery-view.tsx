import {
  CompassIcon,
} from "lucide-react"

import {
  galleryEditorPanels,
  gallerySectionMeta,
} from "@/gallery/editor-panels"
import { gallerySceneBoards } from "@/gallery/scene-content"
import { GalleryWorkspacePreview } from "@/gallery/workspace-preview"
import type { GalleryScene, GallerySection } from "@/gallery/types"
import { Button } from "@/components/ui/button"

function GalleryBoard({ scene }: { scene: GalleryScene }) {
  const cards = gallerySceneBoards[scene.id]

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

export function GallerySidebarPanels({
  section,
}: {
  section: GallerySection
}) {
  const meta = gallerySectionMeta[section]
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
        {galleryEditorPanels.map((panel) => (
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

export type { GalleryScene, GallerySection } from "@/gallery/types"

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

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:p-6">
        <GalleryBoard scene={scene} />

        <section className="rounded-xl border bg-background p-5 text-foreground">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Gallery preview</p>
              <p className="mt-1 text-sm text-muted-foreground">
                A single shadcn-style scene lives here while the sidebar stays
                unchanged.
              </p>
            </div>
            <Button size="sm" type="button" variant="outline">
              <CompassIcon className="size-4" />
              {scene.label}
            </Button>
          </div>

          <div className="mt-5">
            <GalleryWorkspacePreview scene={scene} />
          </div>
        </section>
      </div>
    </div>
  )
}
