import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
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
            在高密度东京，秩序本身就是风景。
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
                <LayerMetric label="crowd" value={area.crowd} />
                <LayerMetric label="transfer" value={area.transfer} />
                <LayerMetric label="commercial" value={area.commercial} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>area</TableHead>
            <TableHead>best time</TableHead>
            <TableHead>route reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {densityAreas.map((area) => (
            <TableRow key={area.area}>
              <TableCell>{area.area}</TableCell>
              <TableCell>{area.bestTime}</TableCell>
              <TableCell>{area.note}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

function LayerMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="canvas-stack-xs">
      <div className="canvas-wrap-sm items-center justify-between">
        <span className="canvas-text-caption text-muted-foreground">{label}</span>
        <span className="canvas-text-caption">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  )
}
