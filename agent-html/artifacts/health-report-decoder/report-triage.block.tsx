import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

import {
  doctorQueue,
  labItemsByStatus,
  sampleReport,
  statusFor,
  statusMeta,
  type ReportStatus,
} from "./data"

const statusOrder: ReportStatus[] = ["normal", "watch", "recheck", "consult"]

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

      <div className="canvas-stack-lg overflow-hidden rounded-md bg-sidebar p-4 md:p-5">
        <div className="canvas-stack-md bg-background/90">
          <div className="canvas-stack-xs">
            <Badge variant="secondary">raw report</Badge>
            <p className="canvas-text-caption text-muted-foreground">
              缩写、单位、参考范围和箭头先原样保留。
            </p>
          </div>

          <div className="overflow-x-auto rounded-md border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>code</TableHead>
                  <TableHead>item</TableHead>
                  <TableHead>result</TableHead>
                  <TableHead>range</TableHead>
                  <TableHead>flag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
            {sampleReport.labItems.map((item) => (
              <TableRow key={item.code}>
                <TableCell className="font-mono">{item.code}</TableCell>
                <TableCell>
                  <span className="whitespace-nowrap">{item.label}</span>
                </TableCell>
                <TableCell className="font-mono">
                  {item.result}
                  {item.unit ? (
                    <span className="text-muted-foreground"> {item.unit}</span>
                  ) : null}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  <span className="whitespace-nowrap">{item.referenceRange}</span>
                </TableCell>
                <TableCell>
                  {item.flag ? (
                    <StatusBadge status={statusFor(item.status).status}>
                      {item.rawNote}
                    </StatusBadge>
                  ) : (
                    <Badge variant="outline">{item.rawNote}</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-stack-md bg-background p-4 md:p-5">
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
                <div className="canvas-stack-xs border-b pb-3 last:border-b-0 last:pb-0" key={status}>
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
                <div className="canvas-stack-xs border-b pb-3 last:border-b-0 last:pb-0" key={item.code}>
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
      </div>
    </section>
  )
}
