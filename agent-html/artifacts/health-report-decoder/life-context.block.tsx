import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

import { lifeContextFields } from "./data"

export function LifeContextBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">近期背景备忘</Badge>
        <h2 className="canvas-text-heading">
          复查前，先把最近两周写下来。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          睡眠、饮食、运动、用药这些信息不负责解释结果，但能让下一次沟通少一点遗漏。
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>字段</TableHead>
              <TableHead>问题</TableHead>
              <TableHead>记录内容</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lifeContextFields.map((field) => (
              <TableRow key={field.label}>
                <TableCell className="font-medium">{field.label}</TableCell>
                <TableCell>{field.prompt}</TableCell>
                <TableCell>{field.record}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Alert>
        <AlertDescription>
          示例数值均为虚构；真实记录请按原始报告和医生建议处理。
        </AlertDescription>
      </Alert>
    </section>
  )
}
