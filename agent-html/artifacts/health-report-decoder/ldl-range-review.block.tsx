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

import { activeIndicatorCode } from "./data/ldl-range-review"
import { labItemByCode, sampleReport } from "./data/report"
import { statusFor } from "./data/status"

const activeItem = labItemByCode(activeIndicatorCode) ?? sampleReport.labItems[0]
const relatedItems = sampleReport.labItems.filter(
  (item) => item.systemId === activeItem.systemId && item.code !== activeItem.code
)

export default function LdlRangeReviewBlock() {
  const meta = statusFor(activeItem.status)

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-2">
        <div className="canvas-stack-sm">
          <Badge variant="secondary">LDL-C 范围复核</Badge>
          <h2 className="canvas-text-heading">
            它不是最吓人的数字，但值得带着旧记录问一次。
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            这页只把 LDL-C 放回血脂这一组：数值、范围、同组指标，以及下次可以怎么问。
          </p>
        </div>

        <div className="canvas-grid-analysis grid gap-6">
          <div className="canvas-stack-sm">
            <StatusBadge status={meta.status}>{activeItem.code}</StatusBadge>
            <h3 className="canvas-text-heading">{activeItem.label}</h3>
            <div className="canvas-wrap-sm items-end">
              <span className="canvas-text-title">{activeItem.result}</span>
              <Badge variant="outline">{activeItem.unit}</Badge>
              <Badge variant="outline">{activeItem.rawNote}</Badge>
            </div>
          </div>

          <div className="canvas-stack-md">
            <div className="canvas-stack-xs">
              <div className="canvas-wrap-sm items-center justify-between">
                <span className="canvas-text-caption text-muted-foreground">
                  报告上的参考范围
                </span>
                <span className="canvas-text-caption">{activeItem.referenceRange}</span>
              </div>
              <Progress value={78} />
              <div className="grid grid-cols-4 gap-2 text-muted-foreground">
                <span className="canvas-text-caption">偏低</span>
                <span className="canvas-text-caption">范围内</span>
                <span className="canvas-text-caption">边缘</span>
                <span className="canvas-text-caption">标记</span>
              </div>
            </div>
            <p className="canvas-text-body">{activeItem.whyItMatters}</p>
          </div>
        </div>
      </div>

      <div className="canvas-grid-2">
        <div className="canvas-stack-sm">
          <Badge variant="outline">同一组血脂</Badge>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>代码</TableHead>
                <TableHead>结果</TableHead>
                <TableHead>参考范围</TableHead>
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

        <div className="canvas-stack-sm">
          <Badge variant="outline">下次可以这样问</Badge>
          <p className="canvas-text-heading">{activeItem.doctorQuestion}</p>
          <p className="canvas-text-body text-muted-foreground">
            先把问题记下来，比自己在页面上猜答案更有用。
          </p>
        </div>
      </div>
    </section>
  )
}
