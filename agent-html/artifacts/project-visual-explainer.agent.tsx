import { Artifact, Block } from "@agent-html/react"

import { AgentWorkflowBlock } from "./project-visual-explainer/agent-workflow.block"
import { CanvasPipelineBlock } from "./project-visual-explainer/canvas-pipeline.block"
import { GuardrailsBlock } from "./project-visual-explainer/guardrails.block"
import { ProjectPurposeBlock } from "./project-visual-explainer/project-purpose.block"
import { SystemTopologyBlock } from "./project-visual-explainer/system-topology.block"

export default function ProjectVisualExplainer() {
  return (
    <Artifact title="AgentHTML Project Visual Explainer">
      <Block id="project-purpose" title="Project Purpose">
        <ProjectPurposeBlock />
      </Block>

      <Block id="system-topology" title="System Topology">
        <SystemTopologyBlock />
      </Block>

      <Block id="canvas-pipeline" title="Canvas Pipeline">
        <CanvasPipelineBlock />
      </Block>

      <Block id="agent-workflow" title="Agent Workflow">
        <AgentWorkflowBlock />
      </Block>

      <Block id="guardrails" title="Guardrails">
        <GuardrailsBlock />
      </Block>
    </Artifact>
  )
}
