import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"

import { lifeFactors, sourceGroups } from "./data"
import { SourceLinks } from "./source-links"

export function LifeContextBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">life context</Badge>
        <h2 className="canvas-text-heading">
          健康管理从理解开始，不从恐惧开始。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          生活因素用于记录和沟通背景，不用来直接解释某个异常来自哪里。
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>背景</TableHead>
              <TableHead>记录示例</TableHead>
              <TableHead>为什么带去沟通</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lifeFactors.map((factor) => (
              <TableRow key={factor.label}>
                <TableCell className="font-medium">{factor.label}</TableCell>
                <TableCell>{factor.examples}</TableCell>
                <TableCell>{factor.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Accordion type="multiple">
        {sourceGroups.map((group) => (
          <AccordionItem key={group.label} value={group.label}>
            <AccordionTrigger>{group.label}</AccordionTrigger>
            <AccordionContent>
              <SourceLinks links={group.links} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Alert>
        <AlertDescription>
          所有来源只用于健康信息理解和公众沟通参考。本 artifact 不处理真实个人医疗数据，
          不替代医生诊断，也不根据示例指标提供用药或治疗建议。
        </AlertDescription>
      </Alert>
    </section>
  )
}
