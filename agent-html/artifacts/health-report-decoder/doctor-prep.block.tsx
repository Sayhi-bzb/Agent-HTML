import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"

import { prepGroups } from "./data"

export function DoctorPrepBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">doctor prep</Badge>
        <h2 className="canvas-text-heading">
          最好的解读，是让你更会和医生沟通。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          这一步不替医生判断，而是把报告里的异常、首次出现、连续变化和背景记录整理成可沟通的问题。
        </p>
      </div>

      <Accordion defaultValue={prepGroups[0]?.label} type="single" collapsible>
        {prepGroups.map((group) => (
          <AccordionItem key={group.label} value={group.label}>
            <AccordionTrigger>
              <span className="canvas-stack-xs">
                <span>{group.label}</span>
                <span className="canvas-text-caption text-muted-foreground">
                  {group.note}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="canvas-stack-sm">
              {group.items.map((item) => (
                <label
                  className="canvas-cluster-sm items-start"
                  key={`${group.label}-${item.label}`}
                >
                  <Checkbox defaultChecked={item.checked} />
                  <span className="canvas-stack-xs">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.detail}</span>
                  </span>
                </label>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="canvas-content-panel-sm canvas-stack-sm">
        <Badge variant="outline">沟通边界</Badge>
        <p className="canvas-text-body text-muted-foreground">
          清单只帮助整理问题、背景和复查线索；不要把它当作治疗方案、药物建议或检查套餐推荐。
        </p>
      </div>
    </section>
  )
}
