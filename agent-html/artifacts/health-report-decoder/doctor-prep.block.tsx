import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"

import {
  doctorQueue,
  labItemByCode,
  statusFor,
} from "./data"

export function DoctorPrepBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">下次就诊小纸条</Badge>
        <h2 className="canvas-text-heading">
          到诊室前，把要问的事写短一点。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          每条只保留项目、这次结果、一个问题。医生更容易接着看。
        </p>
      </div>

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
                      报告标记：{item.rawNote}；参考范围 {item.referenceRange}。
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
      </div>
    </section>
  )
}
