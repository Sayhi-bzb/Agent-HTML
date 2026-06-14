import { MapPin, Moon, PlaneLanding } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { MediaFigure } from "../../components/media-figure"

import { tokyoRoutes } from "./data/map"
import { mediaAssets } from "./data/media"

const arrivalRoute = tokyoRoutes.find((route) => route.id === "arrival-route")

const landingNotes = [
  {
    Icon: PlaneLanding,
    label: "Airport-to-city first",
    text: "Haneda to the city is already a route; keep it readable.",
  },
  {
    Icon: MapPin,
    label: "One anchor is enough",
    text: "Choose a station, hotel area, or nearby meal that makes orientation easier.",
  },
  {
    Icon: Moon,
    label: "Save density for Day 2",
    text: "Shibuya and Shinjuku work better after rest.",
  },
]

export default function SoftLandingBlock() {
  return (
    <section>
      <div className="canvas-grid-gap grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">soft landing</Badge>
            <Badge variant="outline">{arrivalRoute?.day ?? "Day 1"}</Badge>
          </div>
          <h2 className="canvas-text-heading">
            Day 1 is a landing system, not the first chance to prove the trip.
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            Soft Landing treats arrival as a route state: rail in, hotel radius,
            one easy anchor, then stop before Day 2 loses its shape.
          </p>

          <div className="canvas-grid-gap-md">
            {landingNotes.map((note) => (
              <article className="canvas-content-panel canvas-stack-xs" key={note.label}>
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

        <MediaFigure
          asset={mediaAssets.arrival}
          imageClassName="h-full max-h-[460px] min-h-64"
        />
      </div>
    </section>
  )
}
