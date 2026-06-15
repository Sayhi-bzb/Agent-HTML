import {
  Binary,
  FileCode2,
  Package,
  ShieldCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  intakeItems,
  reviewSubject,
  summaryItems,
} from "./data/repo-summary"
import { ReviewMetricValue, ReviewPanel } from "./review-layout"

const summaryItemIcons: Record<string, LucideIcon> = {
  "canvas scripts": FileCode2,
  package: Package,
  "risk candidates": ShieldCheck,
  "symbols indexed": Binary,
}

export default function PrOverviewBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-grid-main-aside items-start">
        <div className="canvas-stack-sm">
          <Badge variant="secondary">{reviewSubject.badge}</Badge>
          <div className="canvas-stack-xs">
            <h1 className="canvas-text-title">
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
          <div className="canvas-stack-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="canvas-text-caption text-muted-foreground">
                review readiness
              </span>
              <ReviewMetricValue className="canvas-text-body">
                {reviewSubject.evidenceCompleteness}%
              </ReviewMetricValue>
            </div>
            <Progress value={reviewSubject.evidenceCompleteness} />
          </div>
          <p className="canvas-text-caption text-muted-foreground">
            {reviewSubject.evidenceNote}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {summaryItems.map((item) => {
            const Icon = summaryItemIcons[item.label]

            return (
              <ReviewPanel className="canvas-stack-xs p-3" key={item.label}>
                <p className="canvas-wrap-sm items-center canvas-text-caption text-muted-foreground">
                  {Icon ? <Icon data-icon="inline-start" /> : null}
                  <span>{item.label}</span>
                </p>
                <ReviewMetricValue>
                  {item.value}
                </ReviewMetricValue>
              </ReviewPanel>
            )
          })}
        </div>
      </div>

      <div className="canvas-grid-2">
        {intakeItems.map((item) => (
          <ReviewPanel className="canvas-stack-xs p-3" key={item.label}>
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
