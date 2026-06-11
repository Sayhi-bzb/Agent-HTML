import { Checkbox } from "../../components/ui/checkbox"
import { StatusBadge } from "../../components/ui/status-badge"
import { reviewChecks, reviewLanes } from "./data/review-decision"

export function ReviewGateBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          review gate
        </p>
        <h2 className="canvas-text-subheading">
          Comments become release conditions.
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.58fr)_minmax(260px,0.42fr)]">
        <div className="grid gap-3 rounded-md bg-background p-4 sm:grid-cols-2">
          {reviewLanes.map((lane) => (
            <div
              className="canvas-stack-xs rounded-md bg-muted/40 p-3"
              key={lane.label}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="canvas-text-caption text-muted-foreground">
                  {lane.label}
                </span>
                <StatusBadge status={lane.status}>{lane.count}</StatusBadge>
              </div>
              <p className="canvas-text-body">{lane.detail}</p>
            </div>
          ))}
        </div>

        <div className="canvas-stack-sm rounded-md bg-background p-4">
          <StatusBadge status="warning">ready after evidence lands</StatusBadge>
          {reviewChecks.map((check) => (
            <label className="flex items-center gap-3" key={check}>
              <Checkbox />
              <span className="canvas-text-body">{check}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}
