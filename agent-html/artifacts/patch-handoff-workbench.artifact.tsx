import { Artifact, Block } from "@agent-html/react"

import { DiffReviewBlock } from "./patch-handoff-workbench/diff-review.block"
import { HandoffBoardBlock } from "./patch-handoff-workbench/handoff-board.block"
import { IssueTriageBlock } from "./patch-handoff-workbench/issue-triage.block"
import { PatchPacketBlock } from "./patch-handoff-workbench/patch-packet.block"
import { ReviewBriefBlock } from "./patch-handoff-workbench/review-brief.block"

export default function PatchHandoffWorkbenchArtifact() {
  return (
    <Artifact title="Patch Handoff Workbench">
      <Block id="review-brief" title="Review Brief">
        <ReviewBriefBlock />
      </Block>

      <Block id="diff-review" title="Diff Review">
        <DiffReviewBlock />
      </Block>

      <Block id="issue-triage" title="Issue Triage">
        <IssueTriageBlock />
      </Block>

      <Block id="handoff-board" title="Handoff Board">
        <HandoffBoardBlock />
      </Block>

      <Block id="patch-packet" title="Patch Packet">
        <PatchPacketBlock />
      </Block>
    </Artifact>
  )
}
