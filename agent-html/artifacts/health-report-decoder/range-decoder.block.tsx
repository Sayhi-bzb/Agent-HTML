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

import { abnormalMatrix, rangeItems } from "./data"

export function RangeDecoderBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">range decoder</Badge>
        <h2 className="canvas-text-heading">
          红色箭头只是提示，不是结论。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          参考范围来自具体实验室报告。真正要看的不是单个箭头，而是偏离程度、相关指标和是否持续出现。
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-3">
        {rangeItems.map((item) => (
          <div className="canvas-content-panel-sm canvas-stack-sm" key={item.label}>
            <div className="canvas-wrap-sm items-center">
              <StatusBadge status={item.status}>{item.label}</StatusBadge>
              <Badge variant="outline">{item.result}</Badge>
            </div>
            <Progress value={item.position} />
            <div className="grid grid-cols-4 gap-2 text-muted-foreground">
              <span className="canvas-text-caption">低值</span>
              <span className="canvas-text-caption">参考</span>
              <span className="canvas-text-caption">轻偏</span>
              <span className="canvas-text-caption">明显</span>
            </div>
            <p className="canvas-text-caption text-muted-foreground">
              {item.exampleRange}
            </p>
            <p className="canvas-text-body">{item.note}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>分层</TableHead>
              <TableHead>常见模式</TableHead>
              <TableHead>下一步</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {abnormalMatrix.map((row) => (
              <TableRow key={row.level}>
                <TableCell className="font-medium">{row.level}</TableCell>
                <TableCell>{row.pattern}</TableCell>
                <TableCell>{row.action}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
