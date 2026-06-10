import { Badge } from "../../components/ui/badge"

import { crewMembers, mediaAssets } from "./data"

const crewPortraits = [
  mediaAssets.crew.reidWiseman,
  mediaAssets.crew.victorGlover,
  mediaAssets.crew.christinaKoch,
  mediaAssets.crew.jeremyHansen,
]

export function CrewManifestBlock() {
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

      <div className="canvas-grid-gap md:grid-cols-4">
        {crewMembers.map((member, index) => {
          const portrait = crewPortraits[index]

          return (
            <article className="canvas-stack-sm" key={member.name}>
              <figure className="canvas-stack-xs">
                <img
                  alt={portrait.alt}
                  className="aspect-[4/5] w-full rounded-md object-cover"
                  src={portrait.src}
                />
                <p className="canvas-text-caption text-muted-foreground">
                  {portrait.credit}
                </p>
              </figure>
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
