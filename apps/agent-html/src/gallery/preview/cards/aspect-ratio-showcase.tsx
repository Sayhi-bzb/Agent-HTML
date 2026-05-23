import { AspectRatio } from "@/gallery/preview/ui/aspect-ratio"
import { ShowcaseShell } from "@/gallery/preview/cards/showcase-shell"

const frames = [
  {
    ratio: 16 / 9,
    key: "landscape",
    tone: "from-primary/85 via-primary/25 to-card",
  },
  {
    ratio: 1,
    key: "square",
    tone: "from-primary/18 via-accent/85 to-secondary/55",
  },
] as const

function AspectRatioCover({ tone }: (typeof frames)[number]) {
  return (
    <div
      className={`h-full w-full rounded-[calc(var(--radius)*1.5)] border border-border/60 bg-gradient-to-br ${tone}`}
    />
  )
}

export function AspectRatioShowcase() {
  return (
    <ShowcaseShell
      title="AspectRatio"
      description="Ratio locking for media surfaces that must stay intentional across widths."
      bodyClassName="grid gap-4"
      footer="The ratio is the point of the example: each frame keeps its composition even as the masonry lane resizes."
    >
      {frames.map((frame) => (
        <div key={frame.key} className="flex flex-col gap-2">
          <AspectRatio ratio={frame.ratio}>
            <AspectRatioCover {...frame} />
          </AspectRatio>
        </div>
      ))}
    </ShowcaseShell>
  )
}
