import { Artifact, Block } from "@agent-html/react"

import { DoctorQuestionListBlock } from "./health-report-decoder/doctor-question-list.block"
import { HealthLiteracySourcesBlock } from "./health-report-decoder/health-literacy-sources.block"
import { LabSystemMapBlock } from "./health-report-decoder/lab-system-map.block"
import { LabTrendReviewBlock } from "./health-report-decoder/lab-trend-review.block"
import { LdlRangeReviewBlock } from "./health-report-decoder/ldl-range-review.block"
import { RecentLifeContextBlock } from "./health-report-decoder/recent-life-context.block"
import { ReportLiteracyCheckBlock } from "./health-report-decoder/report-literacy-check.block"
import { ReportTriageBlock } from "./health-report-decoder/report-triage.block"

export default function HealthReportDecoderArtifact() {
  return (
    <Artifact title="这次体检怎么记">
      <Block id="report-triage" title="报告优先级">
        <ReportTriageBlock />
      </Block>

      <Block id="lab-system-map" title="检验项目分组">
        <LabSystemMapBlock />
      </Block>

      <Block id="ldl-range-review" title="LDL-C 范围复核">
        <LdlRangeReviewBlock />
      </Block>

      <Block id="lab-trend-review" title="检验趋势复核">
        <LabTrendReviewBlock />
      </Block>

      <Block id="report-literacy-check" title="报告阅读自查">
        <ReportLiteracyCheckBlock />
      </Block>

      <Block id="doctor-question-list" title="就诊问题清单">
        <DoctorQuestionListBlock />
      </Block>

      <Block id="recent-life-context" title="近期生活背景">
        <RecentLifeContextBlock />
      </Block>

      <Block id="health-literacy-sources" title="健康阅读资料">
        <HealthLiteracySourcesBlock />
      </Block>
    </Artifact>
  )
}
