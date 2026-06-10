import { Artifact, Block } from "@agent-html/react"

import { DensityLayerBlock } from "./tokyo-three-speeds/density-layer.block"
import { TokyoHeaderBlock } from "./tokyo-three-speeds/header.block"
import { QuietLayerBlock } from "./tokyo-three-speeds/quiet-layer.block"
import { RouteConsoleBlock } from "./tokyo-three-speeds/route-console.block"
import { SoftLandingBlock } from "./tokyo-three-speeds/soft-landing.block"
import { SourcesBlock } from "./tokyo-three-speeds/sources.block"
import { TravelNotesBlock } from "./tokyo-three-speeds/travel-notes.block"

export default function TokyoThreeSpeedsArtifact() {
  return (
    <Artifact title="Three Speeds of Tokyo">
      <Block id="tokyo-header" title="Tokyo Header">
        <TokyoHeaderBlock />
      </Block>

      <Block id="route-console" title="Tokyo Route Console">
        <RouteConsoleBlock />
      </Block>

      <Block id="soft-landing" title="Soft Landing">
        <SoftLandingBlock />
      </Block>

      <Block id="density-layer" title="Density Layer">
        <DensityLayerBlock />
      </Block>

      <Block id="quiet-layer" title="Quiet Layer">
        <QuietLayerBlock />
      </Block>

      <Block id="travel-notes" title="Travel Notes">
        <TravelNotesBlock />
      </Block>

      <Block id="source-registry" title="Source Registry">
        <SourcesBlock />
      </Block>
    </Artifact>
  )
}
