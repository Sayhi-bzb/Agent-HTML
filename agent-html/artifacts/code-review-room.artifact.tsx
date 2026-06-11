import { Artifact, Block } from "@agent-html/react"

import { BlastRadiusBlock } from "./code-review-room/blast-radius.block"
import { CodeMetricsBlock } from "./code-review-room/code-metrics.block"
import { DiffRiskMapBlock } from "./code-review-room/diff-risk-map.block"
import { PrOverviewBlock } from "./code-review-room/pr-overview.block"
import { ReleaseRoutesBlock } from "./code-review-room/release-routes.block"
import { ReviewGateBlock } from "./code-review-room/review-gate.block"
import { RiskEvidenceBlock } from "./code-review-room/risk-evidence.block"

export default function CodeReviewRoomArtifact() {
  return (
    <Artifact title="Code Review Room">
      <Block id="pr-overview" title="PR Overview">
        <PrOverviewBlock />
      </Block>

      <Block id="diff-risk-map" title="Diff Risk Map">
        <DiffRiskMapBlock />
      </Block>

      <Block id="code-metrics" title="Code Metrics">
        <CodeMetricsBlock />
      </Block>

      <Block id="blast-radius" title="Blast Radius">
        <BlastRadiusBlock />
      </Block>

      <Block id="risk-evidence" title="Risk Evidence">
        <RiskEvidenceBlock />
      </Block>

      <Block id="review-gate" title="Review Gate">
        <ReviewGateBlock />
      </Block>

      <Block id="release-routes" title="Release Routes">
        <ReleaseRoutesBlock />
      </Block>
    </Artifact>
  )
}
