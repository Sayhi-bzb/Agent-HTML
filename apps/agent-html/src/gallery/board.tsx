import { gallerySceneBoards } from "@/gallery/scene-content"
import type { GalleryScene } from "@/gallery/types"

export function GalleryBoard({ scene }: { scene: GalleryScene }) {
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
