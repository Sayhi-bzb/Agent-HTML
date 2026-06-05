import { Artifact, Block } from "@agent-html/react"

import { InteractionControlsBlock } from "./interaction-state/interaction-controls.block"
import { KanbanBoardBlock } from "./interaction-state/kanban-board.block"
import { PromptDisplayBlock } from "./interaction-state/prompt-display.block"

export default function InteractionStateArtifact() {
  return (
    <Artifact title="Interaction State Example">
      <Block id="interaction-controls" title="Interaction Controls">
        <InteractionControlsBlock />
      </Block>

      <Block id="prompt-display" title="Prompt Display">
        <PromptDisplayBlock />
      </Block>

      <Block id="kanban-board" title="Kanban Board">
        <KanbanBoardBlock />
      </Block>
    </Artifact>
  )
}
