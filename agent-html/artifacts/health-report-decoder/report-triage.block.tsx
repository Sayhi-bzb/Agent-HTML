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
} from "./data/doctor-question-list"
import {
  labItemsByStatus,
  sampleReport,
} from "./data/report"
import {
  statusFor,
  statusMeta,
} from "./data/status"
import type { ReportStatus } from "./data/types"

const statusOrder: ReportStatus[] = ["normal", "watch", "recheck", "consult"]
const priorityStatuses: ReportStatus[] = ["consult", "recheck", "watch"]

export default function ReportTriageBlock() {
  const priorityItems = priorityStatuses.flatMap((status) =>
    labItemsByStatus(status)
  )

  return (
    <section className="canvas-stack-lg w-full">
      <div className="canvas-stack-sm w-full min-w-0">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">体检后的小记录</Badge>
          <Badge variant="outline">{sampleReport.context}</Badge>
        </div>
        <h1 className="canvas-text-title">这次先记三件事。</h1>
        <p className="canvas-text-body text-muted-foreground">
          不急着给自己下结论。先把<span className="text-foreground">需要问</span>
          {"、"}
          <span className="text-warning">需要复查</span>
          {"、"}需要下次对照的项目放在同一页。
        </p>
      </div>

      <div className="canvas-grid-gap w-full min-w-0 md:grid-cols-[minmax(12rem,0.48fr)_minmax(0,1.52fr)]">
        <aside className="canvas-stack-md w-full min-w-0 border-b md:border-b-0">
          <div className="canvas-stack-xs">
            <Badge variant="secondary">这次先看</Badge>
            <p className="canvas-text-caption text-muted-foreground">
              把<span className="text-destructive">红箭头</span>先变成几个可处理的事项。
            </p>
          </div>

          <div className="canvas-stack-sm">
            {priorityItems.map((item) => {
              const meta = statusFor(item.status)

              return (
                <div className="canvas-stack-xs border-b pb-3 last:border-b-0 last:pb-0" key={item.code}>
                  <div className="canvas-wrap-sm items-center justify-between">
                    <StatusBadge status={meta.status}>{item.code}</StatusBadge>
                    <Badge variant="outline">{meta.lane}</Badge>
                  </div>
                  <p className="canvas-text-body">{item.label}</p>
                  <p className="canvas-text-caption text-muted-foreground">
                    <span className="text-foreground">
                      {item.result}
                    </span>
                    {item.unit ? ` ${item.unit}` : ""} / {item.rawNote}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="canvas-stack-sm pt-2">
            <Badge variant="secondary">下次要问</Badge>
            {doctorQueue.slice(0, 3).map((item, index) => (
              <p className="canvas-text-body" key={item.code}>
                {index + 1}. {item.prompt}
              </p>
            ))}
          </div>
        </aside>

        <div className="canvas-stack-lg w-full min-w-0">
          <div className="canvas-stack-xs w-full min-w-0">
            <Badge variant="secondary">报告摘录</Badge>
            <p className="canvas-text-caption text-muted-foreground">
              原来的<span className="text-foreground">缩写</span>
              {"、"}单位和参考范围保留，方便回看纸质报告。
            </p>
          </div>

          <div className="w-full min-w-0 overflow-x-auto rounded-md border bg-background">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>代码</TableHead>
                  <TableHead>项目</TableHead>
                  <TableHead>结果</TableHead>
                  <TableHead>参考范围</TableHead>
                  <TableHead>标记</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleReport.labItems.map((item) => (
                  <TableRow key={item.code}>
                    <TableCell>{item.code}</TableCell>
                    <TableCell className="whitespace-normal">{item.label}</TableCell>
                    <TableCell>
                      {item.result}
                      {item.unit ? (
                        <span className="text-muted-foreground"> {item.unit}</span>
                      ) : null}
                    </TableCell>
                    <TableCell className="whitespace-normal">{item.referenceRange}</TableCell>
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

          <div className="canvas-grid-gap w-full min-w-0 sm:grid-cols-2">
            {statusOrder.map((status) => {
              const meta = statusMeta[status]
              const items = labItemsByStatus(status)

              return (
                <div className="canvas-stack-xs" key={status}>
                  <StatusBadge status={meta.status}>{meta.label}</StatusBadge>
                  <p className="canvas-text-caption text-muted-foreground">
                    {items.length} 项 / {meta.lane}
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
      </div>

      <Alert>
        <AlertDescription>
          这是一份虚构示例，用来整理问题和复查线索；真正判断仍以医生和原始报告为准。
        </AlertDescription>
      </Alert>
    </section>
  )
}
