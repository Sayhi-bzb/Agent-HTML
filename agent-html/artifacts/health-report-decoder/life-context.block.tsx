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
        <Badge variant="secondary">context registry</Badge>
        <h2 className="canvas-text-heading">
          健康管理从理解开始，不从恐惧开始。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          背景字段只帮助医生理解复查条件和生活背景，不把指标变化直接归因给某个习惯。
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>field</TableHead>
              <TableHead>question</TableHead>
              <TableHead>record</TableHead>
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
          Interpretation boundary: example values are fictional. This artifact prepares questions and records for a clinician; it does not diagnose, prescribe, or replace medical care.
        </AlertDescription>
      </Alert>
    </section>
  )
}
