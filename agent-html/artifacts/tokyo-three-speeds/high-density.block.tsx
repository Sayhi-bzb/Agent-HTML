import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { densityAreas, mediaAssets } from "./data"

export function HighDensityBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-[0.9fr_1.1fr]">
        <div className="canvas-stack-md">
          <div className="canvas-stack-sm">
            <div className="canvas-wrap-sm items-center">
              <Badge variant="secondary">Day 2</Badge>
              <Badge variant="outline">Density Layer</Badge>
            </div>
            <h2 className="canvas-text-heading">
              在高密度东京，秩序本身就是风景。
            </h2>
            <p className="canvas-text-body text-muted-foreground">
              Density is not a mood board. It is crowd flow, transfer logic,
              signage, commerce, and return planning stacked into one day.
            </p>
          </div>

          <figure className="canvas-stack-sm">
            <img
              alt={mediaAssets.density.alt}
              className="max-h-[420px] w-full rounded-md object-cover"
              src={mediaAssets.density.src}
            />
            <p className="canvas-text-caption text-muted-foreground">
              {mediaAssets.density.caption} {mediaAssets.density.credit}.
            </p>
          </figure>
        </div>

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
              <div className="canvas-wrap-sm items-center">
                <Badge>{area.bestTime}</Badge>
                <Badge variant="outline">station logic</Badge>
              </div>
              <p className="canvas-text-body">{area.note}</p>
              <div className="canvas-grid-gap-md md:grid-cols-3">
                <DensityMetric label="crowd" value={area.crowd} />
                <DensityMetric label="transfer" value={area.transfer} />
                <DensityMetric label="commercial" value={area.commercial} />
              </div>
            </TabsContent>
          ))}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>area</TableHead>
                <TableHead>time</TableHead>
                <TableHead>read</TableHead>
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
        </Tabs>
      </div>
    </section>
  )
}

function DensityMetric({ label, value }: { label: string; value: number }) {
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
