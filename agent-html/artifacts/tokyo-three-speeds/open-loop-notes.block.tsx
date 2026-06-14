import { BookOpen, Bookmark, MapPinned, RouteOff } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { artifactPublicUrlFactory } from "../../lib/public-url"

const publicUrl = artifactPublicUrlFactory("tokyo-three-speeds")

const openDoodle = {
  alt: "Illustration of a person moving slowly with loose, unfinished motion.",
  caption:
    "Leave one street, shelf, or garden path unresolved so the next visit already has a beginning.",
}

function OpenLoopDoodle() {
  return (
    <svg
      aria-labelledby="open-loop-doodle-title open-loop-doodle-desc"
      className="mx-auto max-h-72 w-full"
      role="img"
      viewBox="0 0 1024 768"
    >
      <title id="open-loop-doodle-title">
        Unfinished route travel note
      </title>
      <desc id="open-loop-doodle-desc">{openDoodle.alt}</desc>
      <use
        className="fill-ring"
        href={publicUrl("open-doodle-zombieing.svg#open-doodle-zombieing-accent")}
      />
      <use
        className="fill-foreground"
        href={publicUrl("open-doodle-zombieing.svg#open-doodle-zombieing-ink")}
      />
    </svg>
  )
}

const travelNotes = [
  {
    Icon: MapPinned,
    label: "Start with one anchor",
    text: "Use Kiyosumi, Jimbocho, or Yanaka as the place that sets the day speed. Do not add a second district until the first one has actually slowed you down.",
  },
  {
    Icon: BookOpen,
    label: "Protect dwell time",
    text: "Bookstores, gardens, and small streets need unclaimed time. If every stop has a timer, the quiet route becomes another transfer plan.",
  },
  {
    Icon: RouteOff,
    label: "Cut one transfer",
    text: "When the day starts to feel crowded, remove a movement before adding a destination. A shorter Tokyo day can hold more memory.",
  },
  {
    Icon: Bookmark,
    label: "Leave an open loop",
    text: "End with one shelf, street, or garden path unfinished. The point is not to complete Tokyo; it is to know where the next visit begins.",
  },
]

export default function OpenLoopNotesBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">open loop notes</Badge>
          <Badge variant="outline">Day 3</Badge>
        </div>
        <h2 className="canvas-text-heading">
          A useful Tokyo day is not the one that proves the most.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          <span className="text-foreground">Day 3</span> works best as a travel
          note instead of a checklist. Pick one anchor, let the route stay
          short, and treat <em className="text-foreground">unfinished places</em> as part of the
          design rather than a failure of planning.
        </p>
      </div>

      <div className="canvas-grid-gap items-center md:grid-cols-[0.7fr_1fr]">
        <figure className="canvas-stack-sm">
          <div className="p-6">
            <OpenLoopDoodle />
          </div>
          <figcaption className="canvas-stack-xs">
            <Badge variant="outline">unfinished route</Badge>
            <p className="canvas-text-body">
              Leave one street, shelf, or garden path <em className="text-muted-foreground">unresolved</em> so the next
              visit already has a beginning.
            </p>
          </figcaption>
        </figure>

        <div className="canvas-grid-gap md:grid-cols-2">
          {travelNotes.map((note) => (
            <article className="canvas-content-panel canvas-stack-sm" key={note.label}>
              <p className="canvas-wrap-sm items-center canvas-text-body">
                <note.Icon data-icon="inline-start" />
                <span>{note.label}</span>
              </p>
              <p className="canvas-text-caption text-muted-foreground">
                {note.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
