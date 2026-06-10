import { Artifact, Block } from "@agent-html/react"

import { DoctorPrepBlock } from "./health-report-decoder/doctor-prep.block"
import { LifeContextBlock } from "./health-report-decoder/life-context.block"
import { RangeDecoderBlock } from "./health-report-decoder/range-decoder.block"
import { ReportLiteracyCheckBlock } from "./health-report-decoder/report-literacy-check.block"
import { ReportTriageBlock } from "./health-report-decoder/report-triage.block"
import { SystemMapBlock } from "./health-report-decoder/system-map.block"
import { TrendViewBlock } from "./health-report-decoder/trend-view.block"

export default function HealthReportDecoderArtifact() {
  return (
    <Artifact title="Health Report Decoder">
      <Block id="report-triage" title="Report Triage">
        <ReportTriageBlock />
      </Block>

      <Block id="system-map" title="Body System Map">
        <SystemMapBlock />
      </Block>

      <Block id="range-decoder" title="Range Decoder">
        <RangeDecoderBlock />
      </Block>

      <Block id="trend-view" title="Trend View">
        <TrendViewBlock />
      </Block>

      <Block id="report-literacy-check" title="Report Literacy Check">
        <ReportLiteracyCheckBlock />
      </Block>

      <Block id="doctor-prep" title="Doctor Prep">
        <DoctorPrepBlock />
      </Block>

      <Block id="life-context" title="Life Context">
        <LifeContextBlock />
      </Block>
    </Artifact>
  )
}
