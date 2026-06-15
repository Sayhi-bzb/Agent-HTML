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

import { CaseSection, MechanismPanel } from "./case-components"
import { firstDaySteps } from "./data"

export default function FirstDayMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="01 / 第一天" title="新人第一天先做什么">
        第一天不用急着证明自己。先认路、读规则、理解信任等级，再开始发言，会比直接求助或转发资源更顺。
      </CaseSection>

      <MechanismPanel>
        <Timeline defaultValue={firstDaySteps.length}>
          {firstDaySteps.map((step, index) => (
            <TimelineItem key={step.step} step={index + 1}>
              <TimelineHeader>
                <TimelineSeparator />
                <TimelineDate>{step.step}</TimelineDate>
                <TimelineTitle>{step.title}</TimelineTitle>
                <TimelineIndicator />
              </TimelineHeader>
              <TimelineContent>{step.value}</TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </MechanismPanel>
    </section>
  )
}
