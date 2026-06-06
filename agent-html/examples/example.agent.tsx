import { Artifact, Block } from "@agent-html/react"

import { BriefBlock } from "./example/brief.block"
import { HandoffBlock } from "./example/handoff.block"
import { StructureBlock } from "./example/structure.block"
import { WorkflowBlock } from "./example/workflow.block"

export default function ExampleArtifact() {
  return (
    <Artifact title="Split Artifact Pattern">
      <Block id="brief" title="Brief">
        <BriefBlock />
      </Block>

      <Block id="structure" title="Structure">
        <StructureBlock />
      </Block>

      <Block id="workflow" title="Workflow">
        <WorkflowBlock />
      </Block>

      <Block id="handoff" title="Handoff">
        <HandoffBlock />
      </Block>
    </Artifact>
  )
}
