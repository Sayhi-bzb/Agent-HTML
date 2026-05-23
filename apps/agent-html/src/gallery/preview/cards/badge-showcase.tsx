import { Badge } from "@/gallery/preview/ui/badge"
import { ShowcaseShell } from "@/gallery/preview/cards/showcase-shell"
import { FlameIcon, LinkIcon, SparklesIcon } from "lucide-react"

export function BadgeShowcase() {
  return (
    <ShowcaseShell
      title="Badge"
      description="Dense inline labeling for state, emphasis, and lightweight categorization."
      bodyClassName="flex flex-col gap-4"
      footer="A badge showcase needs visible semantic variety, not one lonely pill floating in empty space."
    >
      <div className="flex flex-wrap gap-2">
        <Badge>
          <SparklesIcon />
          Primary
        </Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
        <Badge variant="destructive">
          <FlameIcon />
          Risk
        </Badge>
        <Badge variant="link" asChild>
          <a href="#badge-showcase">
            <LinkIcon />
            Linked
          </a>
        </Badge>
      </div>

      <div className="grid gap-2 rounded-[calc(var(--radius)*1.25)] border border-dashed border-border/70 bg-muted/25 p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="type-label">Shipment checklist</span>
          <Badge variant="secondary">3 labels live</Badge>
        </div>
        <p className="type-supporting text-muted-foreground">
          Use badges when the label must stay adjacent to the object it qualifies.
        </p>
      </div>
    </ShowcaseShell>
  )
}

