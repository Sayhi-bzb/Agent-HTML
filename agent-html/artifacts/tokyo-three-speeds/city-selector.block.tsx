import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/ui/hover-card"
import { Progress } from "../../components/ui/progress"
import { ScrollArea, ScrollBar } from "../../components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group"

import { mapRegions, routeComparison, selectorOptions } from "./data"

export function CitySelectorBlock() {
  const selected = selectorOptions[2]

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">city selector</Badge>
        <h2 className="canvas-text-heading">
          同一座城市，可以被不同的人用不同速度阅读。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          This is the control surface: interest changes route shape, time
          blocks, and the cost of movement.
        </p>
      </div>

      <ToggleGroup type="single" defaultValue={selected.label} className="justify-start">
        {selectorOptions.map((option) => (
          <ToggleGroupItem key={option.label} value={option.label}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="canvas-grid-gap md:grid-cols-[0.9fr_1.1fr]">
        <div className="canvas-stack-md">
          <div className="relative grid min-h-96 grid-cols-3 gap-2 rounded-md bg-muted/40 p-3">
            {mapRegions.map((region) => (
              <HoverCard key={`${region.day}-${region.label}`}>
                <HoverCardTrigger asChild>
                  <Button
                    className="flex min-h-20 flex-col items-start justify-between rounded-sm text-left"
                    variant="outline"
                    type="button"
                  >
                    <span className="canvas-text-caption text-muted-foreground">
                      {region.day}
                    </span>
                    <span className="canvas-text-body">{region.label}</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent>
                  <p className="canvas-text-body">{region.label}</p>
                  <p className="canvas-text-caption text-muted-foreground">
                    Used as a route region in the Tokyo planning layer.
                  </p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
          <p className="canvas-text-caption text-muted-foreground">
            Abstract region layer. © OpenStreetMap contributors. ODPT informs
            transit context; Tokyo Tourism Data informs area-intensity framing.
          </p>
        </div>

        <Tabs defaultValue="route" className="canvas-stack-md">
          <TabsList>
            <TabsTrigger value="route">route</TabsTrigger>
            <TabsTrigger value="time">time</TabsTrigger>
            <TabsTrigger value="load">load</TabsTrigger>
          </TabsList>

          <TabsContent className="canvas-stack-md" value="route">
            <Badge>{selected.label}</Badge>
            <p className="canvas-text-body">{selected.route}</p>
            <div className="canvas-grid-gap-md">
              {selected.dayRewrite.map((item) => (
                <div className="canvas-stack-xs" key={item}>
                  <Badge variant="outline">time block</Badge>
                  <p className="canvas-text-caption text-muted-foreground">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent className="canvas-stack-md" value="time">
            <ScrollArea>
              <div className="flex min-w-max gap-3 pb-3">
                {selectorOptions.map((option) => (
                  <div className="w-64 canvas-stack-sm" key={option.label}>
                    <Badge variant="outline">{option.label}</Badge>
                    {option.dayRewrite.map((item) => (
                      <p
                        className="canvas-text-caption text-muted-foreground"
                        key={item}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </TabsContent>

          <TabsContent className="canvas-stack-md" value="load">
            {selected.load.map((metric) => (
              <div className="canvas-stack-xs" key={metric.label}>
                <div className="canvas-wrap-sm items-center justify-between">
                  <span className="canvas-text-caption text-muted-foreground">
                    {metric.label}
                  </span>
                  <span className="canvas-text-caption">{metric.value}%</span>
                </div>
                <Progress value={metric.value} />
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>interest</TableHead>
            <TableHead>movement cost</TableHead>
            <TableHead>dwell</TableHead>
            <TableHead>route logic</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routeComparison.map((route) => (
            <TableRow key={route.label}>
              <TableCell>{route.label}</TableCell>
              <TableCell>{route.cost}</TableCell>
              <TableCell>{route.dwell}%</TableCell>
              <TableCell>{route.route}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
