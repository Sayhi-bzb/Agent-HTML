import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "../../components/timeline"
import { Badge } from "../../components/ui/badge"
import { BarChart } from "../../components/chart/bar-chart"
import { Progress } from "../../components/ui/progress"

import {
  CaseSection,
  HandbookChartNote,
  handbookRoughOptions,
  MechanismPanel,
} from "./case-components"
import { trustLevels } from "./data"

export default function TrustLevelGuideBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="04 / 信任等级" title="为什么新人权限一开始有限">
        LINUX DO 使用信任等级来区分新账号、稳定参与者和高信任成员。它不是单纯的积分游戏，而是让社区先观察账号是否持续、真实、可靠。
      </CaseSection>

      <div className="canvas-grid-main-aside-lg">
        <MechanismPanel>
          <Timeline defaultValue={trustLevels.length}>
            {trustLevels.map((level, index) => (
              <TimelineItem key={level.level} step={index + 1}>
                <TimelineHeader>
                  <TimelineSeparator />
                  <TimelineDate>{level.level}</TimelineDate>
                  <TimelineTitle>{level.title}</TimelineTitle>
                  <TimelineIndicator />
                </TimelineHeader>
                <TimelineContent>
                  <span className="canvas-text-body text-foreground">
                    {level.role}
                  </span>
                  <span className="block">{level.value}</span>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </MechanismPanel>

        <div className="canvas-stack-md">
          <div className="canvas-stack-sm">
            <div className="canvas-wrap-sm items-center justify-between">
              <h3 className="canvas-text-heading">新人策略</h3>
              <Badge variant="outline">先读再发</Badge>
            </div>
            <Progress value={65} />
            <p className="canvas-text-caption text-muted-foreground">
              如果你刚来，最有效的动作不是马上大量发帖，而是稳定阅读、收藏规则、参与少量高质量讨论。
            </p>
          </div>
          <p className="canvas-text-body text-muted-foreground">
            当权限受限时，先去看信任等级说明。很多限制不是针对某个人，而是社区对新账号的默认保护。
          </p>
        </div>
      </div>

      <MechanismPanel>
        <div className="canvas-grid-main-aside-lg">
          <div className="canvas-stack-sm">
            <Badge variant="outline">成长阶梯图</Badge>
            <h3 className="canvas-text-heading">从熟悉环境到承担维护责任</h3>
            <HandbookChartNote>
              阶梯图表达新人手册里的成长理解，不代表官方权限百分比或真实用户数据。
            </HandbookChartNote>
          </div>
          <BarChart
            data={trustLevels}
            minHeight={300}
            renderer="rough"
            rough={handbookRoughOptions}
            tooltipFields={[
              {
                key: "title",
                label: "阶段",
                value: "title",
              },
              {
                key: "role",
                label: "新人理解",
                value: "role",
              },
              {
                formatter: (value) => `${value}`,
                key: "progress",
                label: "手册进度",
                value: "progress",
              },
            ]}
            tooltipLabel="level"
            xKey="level"
            yValueFormatter={(value) => `${value}`}
            yKey="progress"
          />
        </div>
      </MechanismPanel>
    </section>
  )
}
