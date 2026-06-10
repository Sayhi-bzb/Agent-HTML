import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { StatusBadge } from "../../components/ui/status-badge"

import {
  doctorQueue,
  labItemByCode,
  lifeContextFields,
  statusFor,
} from "./data"

export function DoctorPrepBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">doctor handoff</Badge>
        <h2 className="canvas-text-heading">
          最好的解读，是让你更会和医生沟通。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          这一幕是报告解码后的交付物：问题、背景、复查线索，而不是结论。
        </p>
      </div>

      <div className="rounded-md border bg-background p-4">
        <div className="canvas-stack-md">
          {doctorQueue.map((queueItem, index) => {
            const item = labItemByCode(queueItem.code)
            const meta = statusFor(queueItem.status)

            return (
              <div
                className="canvas-cluster-sm items-start border-b pb-4 last:border-b-0 last:pb-0"
                key={queueItem.code}
              >
                <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                <div className="canvas-stack-sm min-w-0">
                  <div className="canvas-wrap-sm items-center">
                    <StatusBadge status={meta.status}>{queueItem.code}</StatusBadge>
                    <Badge variant="outline">{queueItem.label}</Badge>
                    {item ? (
                      <span className="font-mono text-sm text-muted-foreground">
                        {item.result}
                        {item.unit ? ` ${item.unit}` : ""}
                      </span>
                    ) : null}
                  </div>
                  <p className="canvas-text-body">{queueItem.prompt}</p>
                  {item ? (
                    <p className="canvas-text-caption text-muted-foreground">
                      Bring context: {item.rawNote}, reference {item.referenceRange}.
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {lifeContextFields.slice(0, 3).map((field) => (
          <label
            className="canvas-cluster-sm items-start"
            key={field.label}
          >
            <Checkbox />
            <span className="canvas-stack-xs">
              <span className="font-medium">{field.label}</span>
              <span className="canvas-text-caption text-muted-foreground">
                {field.prompt}
              </span>
            </span>
          </label>
        ))}
      </div>
    </section>
  )
}
