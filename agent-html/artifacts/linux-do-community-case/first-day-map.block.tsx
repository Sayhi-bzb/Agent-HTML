import { Progress } from "../../components/ui/progress"
import { PieChart } from "../../components/chart/pie-chart"

import {
  CaseSection,
  HandbookChartNote,
  handbookRoughOptions,
  MechanismPanel,
  RouteStepCard,
} from "./case-components"
import { firstDayAllocation, firstDaySteps } from "./data"

export default function FirstDayMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="01 / 第一天" title="新人第一天先做什么">
        第一天不用急着证明自己。先认路、读规则、理解信任等级，再开始发言，会比直接求助或转发资源更顺。
      </CaseSection>

      <div className="canvas-grid-main-aside-lg">
        <div className="canvas-stack-sm">
          <div className="canvas-stack-sm">
            <div className="canvas-wrap-sm items-center justify-between">
              <h3 className="canvas-text-heading">完成度路线</h3>
              <span className="canvas-text-caption text-muted-foreground">
                4 个动作
              </span>
            </div>
            <Progress value={100} />
            <p className="canvas-text-body text-muted-foreground">
              第一天的目标不是马上成为活跃成员，而是完成基本认路：知道哪里讨论、哪里查规则、哪里找工具。
            </p>
          </div>
        </div>

        <MechanismPanel>
          <div className="canvas-stack-sm">
            <div className="canvas-wrap-sm items-center justify-between">
              <h3 className="canvas-text-heading">第一天精力分配</h3>
              <span className="canvas-text-caption text-muted-foreground">
                建议比例
              </span>
            </div>
            <PieChart
              data={firstDayAllocation}
              legend
              minHeight={260}
              nameKey="label"
              renderer="rough"
              rough={handbookRoughOptions}
              valueKey="share"
            />
            <HandbookChartNote>
              这是手册建议比例，用来提醒新人先认路、读规则，再开始深度参与。
            </HandbookChartNote>
          </div>
        </MechanismPanel>
      </div>

      <div className="canvas-grid-2">
        {firstDaySteps.map((step) => (
          <RouteStepCard
            action={step.action}
            key={step.step}
            step={step.step}
            title={step.title}
            value={step.value}
          />
        ))}
      </div>
    </section>
  )
}
