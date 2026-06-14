import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  intakeItems,
  reviewSubject,
  summaryItems,
} from "./data/repo-summary"
import { ReviewMetricValue, ReviewPanel, ReviewRailGrid } from "./review-layout"

export default function PrOverviewBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-md">
        <Badge variant="secondary">{reviewSubject.badge}</Badge>
        <div className="canvas-stack-sm">
          <h1 className="canvas-text-title">
            {reviewSubject.title}
          </h1>
          <p className="max-w-4xl canvas-text-body text-muted-foreground">
            {reviewSubject.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="warning">risk review</StatusBadge>
          <StatusBadge status="success">ci passing</StatusBadge>
          <StatusBadge status="default">workspace owner review</StatusBadge>
        </div>
      </div>

      <ReviewRailGrid>
        {summaryItems.map((item) => (
          <ReviewPanel className="canvas-stack-xs" key={item.label}>
            <p className="canvas-text-caption text-muted-foreground">
              {item.label}
            </p>
            <ReviewMetricValue>
              {item.value}
            </ReviewMetricValue>
          </ReviewPanel>
        ))}
      </ReviewRailGrid>

      <ReviewPanel className="canvas-stack-sm">
        <div className="canvas-stack-xs">
          <span className="canvas-text-caption text-muted-foreground">
            evidence completeness
          </span>
          <Progress value={reviewSubject.evidenceCompleteness} />
        </div>
        <p className="canvas-text-caption text-muted-foreground">
          {reviewSubject.evidenceNote}
        </p>
      </ReviewPanel>

      <div className="canvas-stack-sm">
        {intakeItems.map((item) => (
          <ReviewPanel className="canvas-stack-xs" key={item.label}>
            <span className="canvas-text-caption text-muted-foreground">
              {item.label}
            </span>
            <p className="canvas-text-body">{item.value}</p>
          </ReviewPanel>
        ))}
      </div>
    </section>
  )
}
