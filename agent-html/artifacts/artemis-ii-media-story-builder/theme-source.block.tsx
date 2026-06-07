import { ExternalLinkIcon, SearchIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"

import {
  artemisIiSourceSummary,
  artemisIiSourceUpdated,
  artemisIiSourceUrl,
  artemisTimelinePhases,
} from "./data"

type ThemeSourceBlockProps = {
  activePhaseId: string
  endpoint: string
  setActivePhaseId: (id: string) => void
}

export function ThemeSourceBlock({
  activePhaseId,
  endpoint,
  setActivePhaseId,
}: ThemeSourceBlockProps) {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">source URL verified</Badge>
          <Badge variant="outline">updated {artemisIiSourceUpdated}</Badge>
        </div>
        <h2 className="canvas-text-title">Artemis II media source</h2>
        <p className="canvas-text-body text-muted-foreground">
          {artemisIiSourceSummary}
        </p>
      </div>

      <div className="canvas-content-panel canvas-stack-md">
        <div className="canvas-cluster-md items-start justify-between">
          <div className="canvas-stack-xs min-w-0">
            <p className="canvas-text-caption text-muted-foreground">
              Source URL
            </p>
            <a
              className="canvas-text-body break-all underline underline-offset-4"
              href={artemisIiSourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              {artemisIiSourceUrl}
            </a>
          </div>
          <Button asChild type="button" variant="outline">
            <a href={artemisIiSourceUrl} rel="noreferrer" target="_blank">
              <ExternalLinkIcon data-icon="inline-start" />
              Open
            </a>
          </Button>
        </div>

        <Separator />

        <div className="canvas-stack-sm">
          <p className="canvas-text-caption text-muted-foreground">
            NASA Images API search
          </p>
          <p className="canvas-text-body break-all">{endpoint}</p>
        </div>
      </div>

      <div className="canvas-grid-gap md:grid-cols-3">
        {artemisTimelinePhases.map((phase) => (
          <Button
            aria-pressed={activePhaseId === phase.id}
            className="canvas-stack-sm h-auto items-start justify-start whitespace-normal p-3 text-left"
            key={phase.id}
            onClick={() => setActivePhaseId(phase.id)}
            type="button"
            variant={activePhaseId === phase.id ? "default" : "outline"}
          >
            <span className="canvas-wrap-sm items-center">
              <SearchIcon data-icon="inline-start" />
              <span>{phase.label}</span>
            </span>
            <span className="canvas-text-caption text-muted-foreground">
              {phase.searchHint}
            </span>
            <Badge variant="outline">{phase.sourceStatus}</Badge>
          </Button>
        ))}
      </div>
    </section>
  )
}
