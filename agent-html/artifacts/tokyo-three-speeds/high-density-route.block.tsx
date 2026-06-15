import { LogOut, MousePointer2 } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { MediaFigure } from "../../components/media-figure"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { densityAreas } from "./data/high-density-route"
import { mediaAssets } from "./data/media"

export default function HighDensityRouteBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-2">
        <MediaFigure
          asset={mediaAssets.density}
          imageClassName="max-h-[32.5rem]"
        />

        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">high density route</Badge>
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
                <p className="canvas-wrap-sm items-center canvas-text-body">
                  <MousePointer2 data-icon="inline-start" />
                  Use it for: {area.useFor}
                </p>
                <p className="canvas-wrap-sm items-center canvas-text-body">
                  <LogOut data-icon="inline-start" />
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
