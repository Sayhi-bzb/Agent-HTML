import { Badge } from "../../components/ui/badge"
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
                <div className="canvas-grid-gap-md sm:grid-cols-3">
                  <DensityNote label="flow" value={area.flow} />
                  <DensityNote label="interface" value={area.interface} />
                  <DensityNote label="exit" value={area.exitRule} />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>area</TableHead>
            <TableHead>use it for</TableHead>
            <TableHead>avoid when</TableHead>
            <TableHead>exit rule</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {densityAreas.map((area) => (
            <TableRow key={area.area}>
              <TableCell>{area.area}</TableCell>
              <TableCell>{area.useFor}</TableCell>
              <TableCell>{area.avoidWhen}</TableCell>
              <TableCell>{area.exitRule}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}

function DensityNote({ label, value }: { label: string; value: string }) {
  return (
    <div className="canvas-stack-xs border-l pl-3">
      <Badge variant="outline">{label}</Badge>
      <p className="canvas-text-caption text-muted-foreground">{value}</p>
    </div>
  )
}
