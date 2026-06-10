import { Artifact, Block } from "@agent-html/react"

import { DoctorPrepBlock } from "./health-report-decoder/doctor-prep.block"
import { LifeContextBlock } from "./health-report-decoder/life-context.block"
import { RangeDecoderBlock } from "./health-report-decoder/range-decoder.block"
import { ReportLiteracyCheckBlock } from "./health-report-decoder/report-literacy-check.block"
import { ReportTriageBlock } from "./health-report-decoder/report-triage.block"
import { SourcesBlock } from "./health-report-decoder/sources.block"
import { SystemMapBlock } from "./health-report-decoder/system-map.block"
import { TrendViewBlock } from "./health-report-decoder/trend-view.block"

export default function HealthReportDecoderArtifact() {
  return (
    <Artifact title="这次体检怎么记">
      <Block id="report-triage" title="先记三件事">
        <ReportTriageBlock />
      </Block>

      <Block id="system-map" title="按项目归好类">
        <SystemMapBlock />
      </Block>

      <Block id="range-decoder" title="这次先看 LDL-C">
        <RangeDecoderBlock />
      </Block>

      <Block id="trend-view" title="这几年有没有变">
        <TrendViewBlock />
      </Block>

      <Block id="report-literacy-check" title="读报告前自查">
        <ReportLiteracyCheckBlock />
      </Block>

      <Block id="doctor-prep" title="下次就诊小纸条">
        <DoctorPrepBlock />
      </Block>

      <Block id="life-context" title="近期背景备忘">
        <LifeContextBlock />
      </Block>

      <Block id="sources" title="参考资料">
        <SourcesBlock />
      </Block>
    </Artifact>
  )
}
