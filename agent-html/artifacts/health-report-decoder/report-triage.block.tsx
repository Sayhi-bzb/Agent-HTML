import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"

import {
  doctorQueue,
  labItemsByStatus,
  sampleReport,
  statusFor,
  statusMeta,
  type LabItem,
  type ReportStatus,
} from "./data"

const statusOrder: ReportStatus[] = ["normal", "watch", "recheck", "consult"]

function RawReportRow({ item }: { item: LabItem }) {
  const meta = statusFor(item.status)

  return (
    <div className="grid grid-cols-[0.7fr_0.9fr_0.8fr_1fr_0.5fr] items-center gap-3 border-b py-2 last:border-b-0">
      <span className="font-mono text-sm">{item.code}</span>
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        {item.label}
      </span>
      <span className="font-mono text-sm">
        {item.result}
        {item.unit ? <span className="text-muted-foreground"> {item.unit}</span> : null}
      </span>
      <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">
        {item.referenceRange}
      </span>
      {item.flag ? (
        <StatusBadge status={meta.status}>{item.rawNote}</StatusBadge>
      ) : (
        <Badge variant="outline">{item.rawNote}</Badge>
      )}
    </div>
  )
}

export function ReportTriageBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">Health Report Decoder</Badge>
          <Badge variant="outline">{sampleReport.context}</Badge>
        </div>
        <h1 className="canvas-text-title">先看层级，不急着害怕。</h1>
        <p className="canvas-text-body text-muted-foreground">
          同一份报告被拆成三层：左边保留原始噪声，中间把指标重新分层，右边生成可带去沟通的问题。
        </p>
      </div>

      <div className="grid overflow-hidden rounded-md border bg-sidebar md:min-h-[720px] md:grid-cols-3">
        <div className="canvas-stack-md border-b bg-background/90 p-4 md:border-r md:border-b-0 md:p-5">
          <div className="canvas-stack-xs">
            <Badge variant="secondary">raw report</Badge>
            <p className="canvas-text-caption text-muted-foreground">
              缩写、单位、参考范围和箭头先原样保留。
            </p>
          </div>

          <div className="rounded-md border bg-background px-3">
            <div className="grid grid-cols-[0.7fr_0.9fr_0.8fr_1fr_0.5fr] gap-3 border-b py-2 text-xs text-muted-foreground">
              <span>code</span>
              <span>item</span>
              <span>result</span>
              <span>range</span>
              <span>flag</span>
            </div>
            {sampleReport.labItems.map((item) => (
              <RawReportRow item={item} key={item.code} />
            ))}
          </div>
        </div>

        <div className="canvas-stack-md border-b bg-background p-4 md:border-r md:border-b-0 md:p-5">
          <div className="canvas-stack-xs">
            <Badge variant="secondary">triage lanes</Badge>
            <p className="canvas-text-caption text-muted-foreground">
              箭头被重新翻译成关注层级，而不是结论。
            </p>
          </div>

          <div className="canvas-stack-sm">
            {statusOrder.map((status) => {
              const meta = statusMeta[status]
              const items = labItemsByStatus(status)

              return (
                <div className="canvas-content-panel-sm canvas-stack-xs" key={status}>
                  <div className="canvas-wrap-sm items-center justify-between">
                    <StatusBadge status={meta.status}>{meta.label}</StatusBadge>
                    <span className="canvas-text-caption text-muted-foreground">
                      {items.length} item{items.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="canvas-text-caption text-muted-foreground">
                    {meta.lane}
                  </p>
                  <div className="canvas-wrap-sm">
                    {items.map((item) => (
                      <Badge key={item.code} variant="outline">
                        {item.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="canvas-stack-md bg-background/90 p-4 md:p-5">
          <div className="canvas-stack-xs">
            <Badge variant="secondary">doctor queue</Badge>
            <p className="canvas-text-caption text-muted-foreground">
              页面只生成沟通问题，不生成病名或处理方案。
            </p>
          </div>

          <div className="canvas-stack-sm">
            {doctorQueue.map((item, index) => {
              const meta = statusFor(item.status)

              return (
                <div className="canvas-content-panel-sm canvas-stack-xs" key={item.code}>
                  <div className="canvas-wrap-sm items-center">
                    <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                    <StatusBadge status={meta.status}>{item.code}</StatusBadge>
                    <span className="canvas-text-caption text-muted-foreground">
                      {item.label}
                    </span>
                  </div>
                  <p className="canvas-text-body">{item.prompt}</p>
                </div>
              )
            })}
          </div>

          <Alert>
            <AlertDescription>
              Interpretation boundary: this fictional report helps structure questions for a clinician. It does not diagnose, prescribe, or replace medical care.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </section>
  )
}
