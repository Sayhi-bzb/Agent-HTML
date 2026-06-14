import { Badge } from "../../components/ui/badge"
import { MediaFigure } from "../../components/media-figure"

import { mediaAssets } from "./data/media"
import { missionTags, telemetryItems } from "./data/mission-overview"

export default function MissionOverviewBlock() {
  return (
    <section className="canvas-stack-lg">
      <MediaFigure
        asset={mediaAssets.opening}
        imageClassName="max-h-screen"
      />

      <div className="canvas-grid-main-aside">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            {missionTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="canvas-text-title">
            Human spaceflight relearned how to reach lunar space with crew.
          </h1>
          <p className="canvas-text-body text-muted-foreground">
            The page opens from Orion's point of view: Earth is already behind
            the crew, and the completed mission reads first as a return to
            human deep-space flight before it becomes a list of parameters.
          </p>
        </div>

        <div className="canvas-grid-gap-md">
          {telemetryItems.map((item) => (
            <div className="canvas-stack-xs min-w-0" key={item.label}>
              <p className="canvas-text-caption text-muted-foreground">
                {item.label}
              </p>
              <p className="canvas-text-body">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
