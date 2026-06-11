import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Undo2,
  Waves,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { MediaFigure } from "../../components/media-figure"

import { mediaAssets } from "./data/media"
import { closureItems } from "./data/recovery-validation"

const closureItemIcons: Record<string, LucideIcon> = {
  "Next Artemis Step": ArrowUpRight,
  Recovery: Waves,
  Return: Undo2,
  Validation: CheckCircle2,
}

export function RecoveryValidationBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">return and recovery</Badge>
        <h2 className="canvas-text-heading">
          The end of this mission became the starting point for a true return
          to the lunar surface.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          The final scene returns from deep space to Earth, sea recovery, and
          mission validation, closing the flight without turning the ending
          into promotion.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        <MediaFigure
          asset={mediaAssets.splashdown}
          density="compact"
          imageClassName="max-h-96"
        />
        <MediaFigure
          asset={mediaAssets.recovery}
          density="compact"
          imageClassName="max-h-96"
        />
      </div>

      <div className="canvas-grid-gap md:grid-cols-4">
        {closureItems.map((item) => {
          const Icon = closureItemIcons[item.label] ?? Circle

          return (
            <article className="canvas-stack-xs" key={item.label}>
              <p className="canvas-wrap-sm items-center canvas-text-body">
                <Icon data-icon="inline-start" />
                <span>{item.label}</span>
              </p>
              <p className="canvas-text-caption text-muted-foreground">
                {item.summary}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
