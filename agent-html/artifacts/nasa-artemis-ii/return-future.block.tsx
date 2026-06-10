import { Badge } from "../../components/ui/badge"

import { closureItems, mediaAssets } from "./data"

export function ReturnFutureBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">return and recovery</Badge>
        <h2 className="canvas-text-heading">
          The end of this mission became the starting point for a true return
          to the lunar surface.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          The final scene returns from deep space to Earth, sea recovery, and
          mission validation, closing the flight without turning the ending
          into promotion.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        <figure className="canvas-stack-xs">
          <img
            alt={mediaAssets.splashdown.alt}
            className="max-h-96 w-full rounded-md object-cover"
            src={mediaAssets.splashdown.src}
          />
          <p className="canvas-text-caption text-muted-foreground">
            {mediaAssets.splashdown.caption} {mediaAssets.splashdown.credit}.
          </p>
        </figure>
        <figure className="canvas-stack-xs">
          <img
            alt={mediaAssets.recovery.alt}
            className="max-h-96 w-full rounded-md object-cover"
            src={mediaAssets.recovery.src}
          />
          <p className="canvas-text-caption text-muted-foreground">
            {mediaAssets.recovery.caption} {mediaAssets.recovery.credit}.
          </p>
        </figure>
      </div>

      <div className="canvas-grid-gap md:grid-cols-4">
        {closureItems.map((item) => (
          <article className="canvas-stack-xs" key={item.label}>
            <Badge variant="outline">{item.label}</Badge>
            <p className="canvas-text-caption text-muted-foreground">
              {item.summary}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
