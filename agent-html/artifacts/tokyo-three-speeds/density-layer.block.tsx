import { Badge } from "../../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { densityAreas, mediaAssets } from "./data"

export function DensityLayerBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-[0.95fr_1.05fr]">
        <figure className="canvas-stack-sm">
          <img
            alt={mediaAssets.density.alt}
            className="max-h-[520px] w-full rounded-md object-cover"
            src={mediaAssets.density.src}
          />
          <p className="canvas-text-caption text-muted-foreground">
            {mediaAssets.density.caption} {mediaAssets.density.credit}.
          </p>
        </figure>

        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">density layer</Badge>
            <Badge variant="outline">Day 2</Badge>
          </div>
          <h2 className="canvas-text-heading">
            In high-density Tokyo, order becomes the view.
          </h2>
          <Tabs defaultValue="Omotesando" className="canvas-stack-md">
            <TabsList>
              {densityAreas.map((area) => (
                <TabsTrigger key={area.area} value={area.area}>
                  {area.area}
                </TabsTrigger>
              ))}
            </TabsList>
            {densityAreas.map((area) => (
              <TabsContent className="canvas-stack-md" key={area.area} value={area.area}>
                <p className="canvas-text-body">{area.note}</p>
                <p className="canvas-text-body">
                  Use it for: {area.useFor}
                </p>
                <p className="canvas-text-body">
                  Exit when: {area.exitRule}
                </p>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  )
}
