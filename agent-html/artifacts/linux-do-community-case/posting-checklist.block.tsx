import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { RadarChart } from "../../components/chart/radar-chart"
import { StatusBadge } from "../../components/ui/status-badge"
import { SourceLinks } from "../../components/source-links"

import {
  CaseSection,
  ChecklistItem,
  HandbookChartNote,
  handbookRoughOptions,
  MechanismPanel,
} from "./case-components"
import {
  linuxDoSources,
  postingChecklist,
  postingChecklistChartData,
} from "./data"

export default function PostingChecklistBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="05 / 发帖前" title="发帖前检查这几件事">
        好帖子不一定很长，但应该让别人能快速判断你在说什么、需要什么、已经尝试过什么。
      </CaseSection>

      <div className="canvas-grid-main-aside-lg">
        <div className="canvas-grid-2">
          {postingChecklist.map((item) => (
            <ChecklistItem
              hint={item.hint}
              key={item.label}
              label={item.label}
            />
          ))}
        </div>

        <div className="canvas-stack-sm">
          <MechanismPanel>
            <div className="canvas-stack-sm">
              <div className="canvas-wrap-sm items-center justify-between">
                <h3 className="canvas-text-heading">好帖覆盖面</h3>
                <StatusBadge>建议权重</StatusBadge>
              </div>
              <RadarChart
                angleKey="dimension"
                data={postingChecklistChartData}
                minHeight={280}
                renderer="rough"
                rough={handbookRoughOptions}
                tooltipFields={[
                  {
                    formatter: (value) => `${value}`,
                    key: "score",
                    label: "建议权重",
                    value: "score",
                  },
                ]}
                tooltipLabel="dimension"
                valueDomain={[0, 100]}
                valueKey="score"
              />
              <HandbookChartNote>
                这是发帖前自检模型，不是评分系统。覆盖越完整，别人越容易理解和回复。
              </HandbookChartNote>
            </div>
          </MechanismPanel>
          <Alert>
            <AlertDescription>
              如果不确定能不能发，先看社区守则；如果不确定去哪发，先搜索旧帖或看 Wiki 入口。
            </AlertDescription>
          </Alert>
          <SourceLinks density="compact" links={linuxDoSources.handbook} />
        </div>
      </div>

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
    </section>
  )
}
