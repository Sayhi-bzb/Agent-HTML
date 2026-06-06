import { Artifact, Block } from "@agent-html/react"

import { CodeBlockDemoBlock } from "./test/code-block-demo.block"
import { InteractionControlsBlock } from "./test/interaction-controls.block"
import { KanbanBoardBlock } from "./test/kanban-board.block"
import { PromptDisplayBlock } from "./test/prompt-display.block"
import { UsageChartBlock } from "./test/usage-chart.block"

export default function TestArtifact() {
  return (
    <Artifact title="Test">
      <Block id="interaction-controls" title="Interaction Controls">
        <InteractionControlsBlock />
      </Block>

      <Block id="kanban-board" title="Kanban Board">
        <KanbanBoardBlock />
      </Block>

      <Block id="code-block-demo" title="Code Block Demo">
        <CodeBlockDemoBlock />
      </Block>

      <Block id="usage-chart" title="Usage Chart">
        <UsageChartBlock />
      </Block>

      <Block id="prompt-display" title="Prompt Display">
        <PromptDisplayBlock />
      </Block>
    </Artifact>
  )
}
