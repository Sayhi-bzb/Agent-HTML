import { Separator } from "@/gallery/preview/ui/separator"
import { ShowcaseShell } from "@/gallery/preview/cards/showcase-shell"

export function SeparatorShowcase() {
  return (
    <ShowcaseShell
      title="Separator"
      description="Subtle division for toolbars, stacked sections, and dense informational groupings."
      bodyClassName="grid gap-4"
      footer="The card shows both horizontal and vertical separators in real layout roles instead of isolated strokes."
    >
      <div className="flex items-center justify-between rounded-[calc(var(--radius)*1.25)] border border-border/70 bg-muted/20 px-3 py-2">
        <span className="type-label">Overview</span>
        <Separator className="mx-3 h-4" orientation="vertical" />
        <span className="type-label">Artifacts</span>
        <Separator className="mx-3 h-4" orientation="vertical" />
        <span className="type-label">Proof</span>
      </div>

      <div className="rounded-[calc(var(--radius)*1.25)] border border-border/70 bg-background/70 px-3 py-3">
        <p className="type-label">Section break</p>
        <p className="type-supporting mt-1 text-muted-foreground">
          A horizontal separator should create breathing room without pretending to be content.
        </p>
        <Separator className="my-3" />
        <p className="type-body text-foreground/90">
          This lower block reads as the next segment because the separator does real grouping work.
        </p>
      </div>
    </ShowcaseShell>
  )
}

