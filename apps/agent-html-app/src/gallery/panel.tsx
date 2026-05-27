import { AgentEventLabSurface } from "@/app/gallery/agent-lab"
import type { GalleryScene } from "@/app/gallery/types"
import { GalleryWorkspaceSurface } from "@/app/gallery/workspace-surface"
import { ScrollArea } from "@/app/shared/ui/scroll-area"

export function GalleryPanel({
  scene,
}: {
  scene: GalleryScene
}) {
  const content =
    scene.id === "agent-event-lab" ? (
      <AgentEventLabSurface />
    ) : (
      <GalleryWorkspaceSurface />
    )

  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex min-h-full flex-col p-4 md:p-6">
          {content}
        </div>
      </ScrollArea>
    </div>
  )
}
