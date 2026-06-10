import { BookOpen, Bookmark, MapPinned, RouteOff } from "lucide-react"

import { Badge } from "../../components/ui/badge"

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

export function TravelNotesBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">travel notes</Badge>
          <Badge variant="outline">Day 3</Badge>
        </div>
        <h2 className="canvas-text-heading">
          A useful Tokyo day is not the one that proves the most.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          Day 3 works best as a travel note instead of a checklist. Pick one
          anchor, let the route stay short, and treat unfinished places as part
          of the design rather than a failure of planning.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        {travelNotes.map((note) => (
          <article className="canvas-stack-sm border-l pl-4" key={note.label}>
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
    </section>
  )
}
