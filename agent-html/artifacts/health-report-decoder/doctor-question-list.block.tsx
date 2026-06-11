import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"

import {
  doctorQueue,
} from "./data/doctor-question-list"
import { labItemByCode } from "./data/report"
import { statusFor } from "./data/status"

function DoctorPrepIllustration() {
  return (
    <svg
      aria-labelledby="doctor-question-list-illustration-title"
      className="max-h-80 w-full object-contain"
      role="img"
      viewBox="0 0 738.21997 557.74675"
    >
      <title id="doctor-question-list-illustration-title">
        整理就诊问题的待办清单插图
      </title>
      <use
        className="fill-border"
        href="/__agent-html/artifacts/health-report-decoder/public/undraw_chore-list.svg#undraw-chore-list-muted"
      />
      <use
        className="fill-ring"
        href="/__agent-html/artifacts/health-report-decoder/public/undraw_chore-list.svg#undraw-chore-list-accent"
      />
      <use
        className="fill-background"
        href="/__agent-html/artifacts/health-report-decoder/public/undraw_chore-list.svg#undraw-chore-list-contrast"
      />
      <use
        className="fill-muted-foreground"
        href="/__agent-html/artifacts/health-report-decoder/public/undraw_chore-list.svg#undraw-chore-list-skin"
      />
      <use
        className="fill-foreground"
        href="/__agent-html/artifacts/health-report-decoder/public/undraw_chore-list.svg#undraw-chore-list-ink"
      />
    </svg>
  )
}

export function DoctorQuestionListBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">就诊问题清单</Badge>
        <h2 className="canvas-text-heading">
          到诊室前，把要问的事写短一点。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          每条只保留项目、这次结果、一个问题。医生更容易接着看。
        </p>
      </div>

      <div className="grid grid-cols-[1fr_0.72fr] gap-6 max-sm:grid-cols-1">
        <div className="canvas-stack-md min-w-0">
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

        <figure className="flex items-center justify-center md:justify-end">
          <DoctorPrepIllustration />
        </figure>
      </div>
    </section>
  )
}
