import { Progress } from "@/app/shared/ui/progress"
import { ShowcaseShell } from "@/app/gallery/preview/cards/showcase-shell"

const tracks = [
  { label: "Coverage", value: 84 },
  { label: "Review", value: 61 },
  { label: "Proofing", value: 37 },
] as const

export function ProgressShowcase() {
  return (
    <ShowcaseShell
      title="Progress"
      description="Linear completion feedback for pacing, readiness, and staged task movement."
      bodyClassName="flex flex-col gap-4"
      footer="Multiple bars make the component meaningful by showing relative progress instead of a decorative line."
    >
      {tracks.map((track) => (
        <div key={track.label} className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <span className="type-label">{track.label}</span>
            <span className="type-supporting text-muted-foreground">
              {track.value}%
            </span>
          </div>
          <Progress value={track.value} />
        </div>
      ))}
    </ShowcaseShell>
  )
}

