import { Badge } from "../../components/ui/badge"
import { SourceLinks } from "../../components/source-links"

import { sourceGroups } from "./data/sources"

const photosGroup = sourceGroups.find((group) => group.label === "Photos")
const rightColumnGroups = sourceGroups.filter(
  (group) => group.label !== "Photos"
)

export default function MediaSourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">media sources</Badge>
        <h2 className="canvas-text-heading">Tokyo media and data sources</h2>
        <p className="canvas-text-body text-muted-foreground">
          Source details stay collected here so the route console can use
          imagery, map layers, and tourism context without scattering
          attribution through every block.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        {photosGroup ? (
          <div className="canvas-stack-sm">
            <Badge variant="outline">{photosGroup.label}</Badge>
            <SourceLinks links={photosGroup.links} />
          </div>
        ) : null}

        <div className="canvas-stack-lg">
          {rightColumnGroups.map((group) => (
            <div className="canvas-stack-sm" key={group.label}>
              <Badge variant="outline">{group.label}</Badge>
              <SourceLinks links={group.links} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
