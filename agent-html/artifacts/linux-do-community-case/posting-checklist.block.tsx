import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { StatusBadge } from "../../components/ui/status-badge"
import { SourceLinks } from "../../components/source-links"

import { CaseSection, MechanismPanel } from "./case-components"
import { linuxDoSources, postingChecklist } from "./data"

export default function PostingChecklistBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="05 / 发帖前" title="发帖前检查这几件事">
        好帖子不一定很长，但应该让别人能快速判断你在说什么、需要什么、已经尝试过什么。
      </CaseSection>

      <div className="canvas-grid-main-aside-lg">
        <MechanismPanel>
          <Accordion collapsible defaultValue={postingChecklist[0]?.label} type="single">
            {postingChecklist.map((item) => (
              <AccordionItem key={item.label} value={item.label}>
                <AccordionTrigger>
                  <span className="canvas-wrap-sm items-center">
                    <StatusBadge>检查</StatusBadge>
                    <span>{item.label}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="canvas-text-caption text-muted-foreground">
                    {item.value}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </MechanismPanel>

        <div className="canvas-stack-sm">
          <Alert>
            <AlertDescription>
              如果不确定能不能发，先看社区守则；如果不确定去哪发，先搜索旧帖或看 Wiki 入口。
            </AlertDescription>
          </Alert>
          <SourceLinks density="compact" links={linuxDoSources.handbook} />
        </div>
      </div>
    </section>
  )
}
