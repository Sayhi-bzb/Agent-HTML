import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { SourceLinks } from "../../components/source-links"

import { sourceLinks } from "./data/sources"

const sourceGroups = [
  { label: "Opening", links: sourceLinks.opening },
  { label: "Crew", links: sourceLinks.crew },
  { label: "Launch", links: sourceLinks.launch },
  { label: "Route", links: sourceLinks.route },
  { label: "Lunar flyby", links: sourceLinks.lunar },
  { label: "Return", links: sourceLinks.return },
]

export default function MediaSourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">media sources</Badge>
        <h2 className="canvas-text-heading">NASA media sources and usage</h2>
        <p className="canvas-text-body text-muted-foreground">
          Source links are collected here so the mission story can read
          continuously while every image and media direction remains traceable.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        {sourceGroups.map((group) => (
          <div className="canvas-stack-xs" key={group.label}>
            <Badge variant="outline">{group.label}</Badge>
            <SourceLinks density="compact" links={group.links} />
          </div>
        ))}
      </div>

      <Alert>
        <AlertDescription>
          Use official NASA media sources, preserve necessary credit, and follow
          the NASA images and media usage guidance.
        </AlertDescription>
      </Alert>

      <SourceLinks density="compact" links={sourceLinks.mediaUsage} />
    </section>
  )
}
