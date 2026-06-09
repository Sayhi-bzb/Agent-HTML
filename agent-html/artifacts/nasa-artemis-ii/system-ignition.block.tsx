import { Badge } from "../../components/ui/badge"

import { mediaAssets, systemPanels } from "./data"

export function SystemIgnitionBlock() {
  return (
    <section className="canvas-stack-lg">
      <figure className="canvas-stack-sm">
        <img
          alt={mediaAssets.launch.alt}
          className="max-h-screen w-full rounded-md object-cover"
          src={mediaAssets.launch.src}
        />
        <p className="canvas-text-caption text-muted-foreground">
          {mediaAssets.launch.caption} {mediaAssets.launch.credit}.
        </p>
      </figure>

      <div className="canvas-grid-gap md:grid-cols-[2fr_1fr]">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">Launch Complex 39B</Badge>
            <Badge variant="outline">system ignition</Badge>
          </div>
          <h2 className="canvas-text-heading">
            一整套深空系统，从地面同时启动。
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            The launch image should show SLS, flame, smoke, tower structure, and
            mission environment together. It is the entry point to the system,
            not the whole story.
          </p>
        </div>

        <div className="canvas-grid-gap-md">
          {systemPanels.map((panel) => (
            <article className="canvas-stack-xs" key={panel.label}>
              <Badge variant="outline">{panel.label}</Badge>
              <p className="canvas-text-caption text-muted-foreground">
                {panel.summary}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
