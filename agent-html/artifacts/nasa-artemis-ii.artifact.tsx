import { Artifact, Block } from "@agent-html/react"

import { CrewManifestBlock } from "./nasa-artemis-ii/crew-manifest.block"
import { LaunchSystemBlock } from "./nasa-artemis-ii/launch-system.block"
import { LunarFlybyBlock } from "./nasa-artemis-ii/lunar-flyby.block"
import { MediaSourcesBlock } from "./nasa-artemis-ii/media-sources.block"
import { MissionOverviewBlock } from "./nasa-artemis-ii/mission-overview.block"
import { MissionRouteBlock } from "./nasa-artemis-ii/mission-route.block"
import { RecoveryValidationBlock } from "./nasa-artemis-ii/recovery-validation.block"

export default function NasaArtemisIiArtifact() {
  return (
    <Artifact title="Artemis II: Returning to Lunar Space">
      <Block id="mission-overview" title="Mission Overview">
        <MissionOverviewBlock />
      </Block>

      <Block id="crew-manifest" title="Crew Manifest">
        <CrewManifestBlock />
      </Block>

      <Block id="launch-system" title="Launch System">
        <LaunchSystemBlock />
      </Block>

      <Block id="mission-route" title="Mission Route">
        <MissionRouteBlock />
      </Block>

      <Block id="lunar-flyby" title="Lunar Flyby">
        <LunarFlybyBlock />
      </Block>

      <Block id="recovery-validation" title="Recovery Validation">
        <RecoveryValidationBlock />
      </Block>

      <Block id="media-sources" title="Media Sources">
        <MediaSourcesBlock />
      </Block>
    </Artifact>
  )
}
