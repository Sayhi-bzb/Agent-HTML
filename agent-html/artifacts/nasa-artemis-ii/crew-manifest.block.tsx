import { Badge } from "../../components/ui/badge"
import { MediaFigure } from "../../components/media-figure"

import { crewMembers } from "./data/crew-manifest"
import { mediaAssets } from "./data/media"

export default function CrewManifestBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">crew manifest</Badge>
        <h2 className="canvas-text-heading">
          This flight carried today's crew, not only a technical system.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          Four mission-pass panels identify who flew without turning the
          section into long biography.
        </p>
      </div>

      <div className="canvas-grid-4">
        {crewMembers.map((member) => {
          const portrait = mediaAssets.crew[member.portraitKey]

          return (
            <article className="canvas-stack-sm" key={member.name}>
              <MediaFigure
                asset={portrait}
                density="compact"
                imageClassName="aspect-[4/5]"
                showCaption={false}
              />
              <div className="canvas-stack-xs">
                <p className="canvas-text-body">{member.name}</p>
                <div className="canvas-wrap-sm items-center">
                  <Badge>{member.role}</Badge>
                  <Badge variant="outline">{member.agency}</Badge>
                </div>
              </div>
              <p className="canvas-text-caption text-muted-foreground">
                {member.meaning}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
