import {
  Circle,
  RadioTower,
  Rocket,
  ShipWheel,
  TowerControl,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"

import { mediaAssets, systemPanels } from "./data"

const systemPanelIcons: Record<string, LucideIcon> = {
  "Ground Systems": TowerControl,
  "Mission Control": RadioTower,
  Orion: ShipWheel,
  SLS: Rocket,
}

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
            <StatusBadge status="warning">system ignition</StatusBadge>
          </div>
          <h2 className="canvas-text-heading">
            A full <span className="text-ring">deep-space system</span> came
            alive from the ground.
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            <span className="font-mono text-foreground">SLS</span>, flame,
            smoke, tower structure, and mission environment appear together.{" "}
            <strong className="font-medium text-foreground">Launch</strong> is
            the entry point to the system, not the whole story.
          </p>
        </div>

        <div className="canvas-grid-gap-md">
          {systemPanels.map((panel) => {
            const Icon = systemPanelIcons[panel.label] ?? Circle

            return (
              <article className="canvas-stack-xs" key={panel.label}>
                <p className="canvas-wrap-sm items-center canvas-text-body">
                  <Icon data-icon="inline-start" />
                  <span className="font-medium">{panel.label}</span>
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
