import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
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
  activeIndicatorCode,
  labItemByCode,
  sampleReport,
  statusFor,
} from "./data"

const activeItem = labItemByCode(activeIndicatorCode) ?? sampleReport.labItems[0]
const relatedItems = sampleReport.labItems.filter(
  (item) => item.systemId === activeItem.systemId && item.code !== activeItem.code
)

export function RangeDecoderBlock() {
  const meta = statusFor(activeItem.status)

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-stack-sm">
          <Badge variant="secondary">active indicator</Badge>
          <h2 className="canvas-text-heading">
            红色箭头被拆成位置、组合和问题。
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            这里不直接解释成疾病。先看它在报告里的原始位置，再看同系统指标和要问医生的问题。
          </p>
        </div>

        <div className="rounded-md border bg-background p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="canvas-stack-sm">
              <StatusBadge status={meta.status}>{activeItem.code}</StatusBadge>
              <h3 className="canvas-text-heading">{activeItem.label}</h3>
              <div className="canvas-wrap-sm items-end">
                <span className="font-mono text-3xl">{activeItem.result}</span>
                <Badge variant="outline">{activeItem.unit}</Badge>
                <Badge variant="outline">{activeItem.rawNote}</Badge>
              </div>
            </div>

            <div className="canvas-stack-sm">
              <div className="canvas-stack-xs">
                <div className="canvas-wrap-sm items-center justify-between">
                  <span className="canvas-text-caption text-muted-foreground">
                    report-specific reference
                  </span>
                  <span className="font-mono text-xs">{activeItem.referenceRange}</span>
                </div>
                <Progress value={78} />
                <div className="grid grid-cols-4 gap-2 text-muted-foreground">
                  <span className="canvas-text-caption">low</span>
                  <span className="canvas-text-caption">inside</span>
                  <span className="canvas-text-caption">edge</span>
                  <span className="canvas-text-caption">flag</span>
                </div>
              </div>
              <p className="canvas-text-body">{activeItem.whyItMatters}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="canvas-stack-md">
        <div className="canvas-stack-sm">
          <Badge variant="outline">same system signals</Badge>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>code</TableHead>
                <TableHead>result</TableHead>
                <TableHead>range</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedItems.map((item) => (
                <TableRow key={item.code}>
                  <TableCell>{item.code}</TableCell>
                  <TableCell>
                    {item.result}
                    {item.unit ? ` ${item.unit}` : ""}
                  </TableCell>
                  <TableCell>{item.referenceRange}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="canvas-stack-sm border-t pt-4">
          <Badge variant="outline">question generated</Badge>
          <p className="canvas-text-heading">{activeItem.doctorQuestion}</p>
          <p className="canvas-text-body text-muted-foreground">
            参考范围来自这份虚构报告。不同实验室、个人背景和医生判断可能改变解释方式。
          </p>
        </div>
      </div>
    </section>
  )
}
