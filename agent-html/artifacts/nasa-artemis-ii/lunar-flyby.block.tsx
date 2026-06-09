import { Badge } from "../../components/ui/badge"

import { lunarMediaBeats, mediaAssets } from "./data"

export function LunarFlybyBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-md">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">lunar flyby</Badge>
          <Badge variant="outline">visual climax</Badge>
        </div>
        <h2 className="canvas-text-heading">
          月球不再只是夜空里的远方，而是一次飞行中的真实地标。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          This section should use fewer, stronger visuals: one primary lunar
          flyby image and supporting frames for distance, scale, solitude, and
          the Earth-Moon relationship.
        </p>

        <figure className="canvas-stack-sm">
          <img
            alt={mediaAssets.lunarFlyby.earthset.alt}
            className="max-h-screen w-full rounded-md object-cover"
            src={mediaAssets.lunarFlyby.earthset.src}
          />
          <p className="canvas-text-caption text-muted-foreground">
            {mediaAssets.lunarFlyby.earthset.caption}{" "}
            {mediaAssets.lunarFlyby.earthset.credit}.
          </p>
        </figure>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        <figure className="canvas-stack-sm">
          <video
            className="max-h-80 w-full rounded-md"
            controls
            muted
            preload="metadata"
            src={mediaAssets.lunarFlyby.flybyVideo.src}
          >
            This browser cannot play the simulated Artemis II lunar flyby video.
          </video>
          <p className="canvas-text-caption text-muted-foreground">
            {mediaAssets.lunarFlyby.flybyVideo.caption}{" "}
            {mediaAssets.lunarFlyby.flybyVideo.credit}.
          </p>
        </figure>
        <div className="canvas-grid-gap-md">
          {lunarMediaBeats.map((beat) => (
            <article className="canvas-stack-xs" key={beat.angle}>
              <Badge variant="outline">{beat.angle}</Badge>
              <p className="canvas-text-body text-muted-foreground">
                {beat.title}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
