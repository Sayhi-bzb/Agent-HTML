import { GalleryWorkspaceSurface } from "@/app/gallery/workspace-surface"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import type { GalleryViewId } from "@/app/gallery/views"

export function GalleryPanel({
  activeViewId,
}: {
  activeViewId: GalleryViewId
}) {
  const isThemeView = activeViewId === "theme"

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col p-4 md:p-6">
          {isThemeView ? (
            <GalleryWorkspaceSurface />
          ) : (
            <GalleryMarketPlaceholder viewId={activeViewId} />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function GalleryMarketPlaceholder({ viewId }: { viewId: Exclude<GalleryViewId, "theme"> }) {
  const copy =
    viewId === "components"
      ? {
          eyebrow: "Component Market",
          title: "Component packs are next",
          body: "This view is reserved for browsing, inspecting, and installing reusable artifact component sets.",
        }
      : {
          eyebrow: "Pet Market",
          title: "Companion assets are next",
          body: "This view is reserved for browsing, previewing, and installing workspace pet assets.",
        }

  return (
    <section className="grid min-h-[24rem] place-items-center rounded-xl border bg-background p-8 text-center text-foreground">
      <div className="max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {copy.eyebrow}
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {copy.body}
        </p>
      </div>
    </section>
  )
}
