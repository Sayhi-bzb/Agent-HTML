import {
  Circle,
  RadioTower,
  Rocket,
  ShipWheel,
  TowerControl,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { MediaFigure } from "../../components/media-figure"
import { StatusBadge } from "../../components/ui/status-badge"

import { systemPanels } from "./data/launch-system"
import { mediaAssets } from "./data/media"

const systemPanelIcons: Record<string, LucideIcon> = {
  "Ground Systems": TowerControl,
  "Mission Control": RadioTower,
  Orion: ShipWheel,
  SLS: Rocket,
}

export default function LaunchSystemBlock() {
  return (
    <section className="canvas-stack-lg">
      <MediaFigure asset={mediaAssets.launch} imageClassName="max-h-screen" />

      <div className="canvas-grid-gap md:grid-cols-[2fr_1fr]">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">Launch Complex 39B</Badge>
            <StatusBadge status="warning">launch system</StatusBadge>
          </div>
          <h2 className="canvas-text-heading">
            A full <span className="text-primary">deep-space system</span> came
            alive from the ground.
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            SLS, flame, smoke, tower structure, and mission environment appear
            together. Launch is the entry point to the system, not the whole
            story.
          </p>
        </div>

        <div className="canvas-grid-gap-md">
          {systemPanels.map((panel) => {
            const Icon = systemPanelIcons[panel.label] ?? Circle

            return (
              <article className="canvas-stack-xs" key={panel.label}>
                <p className="canvas-wrap-sm items-center canvas-text-body">
                  <Icon data-icon="inline-start" />
                  <span>{panel.label}</span>
                </p>
                <p className="canvas-text-caption text-muted-foreground">
                  {panel.summary}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
