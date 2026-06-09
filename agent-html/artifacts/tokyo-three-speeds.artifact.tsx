import { Artifact, Block } from "@agent-html/react"

import { CitySelectorBlock } from "./tokyo-three-speeds/city-selector.block"
import { HighDensityBlock } from "./tokyo-three-speeds/high-density.block"
import { QuietTokyoBlock } from "./tokyo-three-speeds/quiet-tokyo.block"
import { RhythmPlanBlock } from "./tokyo-three-speeds/rhythm-plan.block"
import { SoftLandingBlock } from "./tokyo-three-speeds/soft-landing.block"
import { SourcesBlock } from "./tokyo-three-speeds/sources.block"
import { UnfinishedRouteBlock } from "./tokyo-three-speeds/unfinished-route.block"

export default function TokyoThreeSpeedsArtifact() {
  return (
    <Artifact title="Three Speeds of Tokyo">
      <Block id="soft-landing" title="Soft Landing">
        <SoftLandingBlock />
      </Block>

      <Block id="three-day-rhythm" title="Three-Day Rhythm">
        <RhythmPlanBlock />
      </Block>

      <Block id="high-density" title="High Density Tokyo">
        <HighDensityBlock />
      </Block>

      <Block id="quiet-tokyo" title="Quiet Tokyo">
        <QuietTokyoBlock />
      </Block>

      <Block id="city-selector" title="City Selector">
        <CitySelectorBlock />
      </Block>

      <Block id="unfinished-route" title="Unfinished Route">
        <UnfinishedRouteBlock />
      </Block>

      <Block id="sources" title="Sources">
        <SourcesBlock />
      </Block>
    </Artifact>
  )
}
