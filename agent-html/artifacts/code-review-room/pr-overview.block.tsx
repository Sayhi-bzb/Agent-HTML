import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  intakeItems,
  reviewSubject,
  summaryItems,
} from "./data/repo-summary"

export default function PrOverviewBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.58fr)_minmax(280px,0.42fr)] lg:items-end">
        <div className="canvas-stack-md">
          <Badge variant="secondary">{reviewSubject.badge}</Badge>
          <div className="canvas-stack-sm">
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-5xl">
              {reviewSubject.title}
            </h1>
            <p className="canvas-text-body text-muted-foreground">
              {reviewSubject.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status="warning">risk review</StatusBadge>
            <StatusBadge status="success">ci passing</StatusBadge>
            <StatusBadge status="default">workspace owner review</StatusBadge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {summaryItems.map((item) => (
            <div className="rounded-md bg-muted/40 p-4" key={item.label}>
              <p className="canvas-text-caption text-muted-foreground">
                {item.label}
              </p>
              <p className="font-mono text-2xl font-semibold tracking-normal">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 rounded-md bg-background p-4 md:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)]">
        <div className="canvas-stack-xs">
          <span className="canvas-text-caption text-muted-foreground">
            evidence completeness
          </span>
          <Progress value={reviewSubject.evidenceCompleteness} />
        </div>
        <p className="canvas-text-caption text-muted-foreground">
          {reviewSubject.evidenceNote}
        </p>
      </div>

      <div className="grid gap-3 rounded-md bg-background p-4 md:grid-cols-4">
        {intakeItems.map((item) => (
          <div className="canvas-stack-xs" key={item.label}>
            <span className="canvas-text-caption text-muted-foreground">
              {item.label}
            </span>
            <p className="canvas-text-body">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
