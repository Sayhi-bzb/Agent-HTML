import { Artifact, Block } from "@agent-html/react"

import { CrewManifestBlock } from "./nasa-artemis-ii/crew-manifest.block"
import { LunarFlybyBlock } from "./nasa-artemis-ii/lunar-flyby.block"
import { MissionRouteBlock } from "./nasa-artemis-ii/mission-route.block"
import { OrionWindowBlock } from "./nasa-artemis-ii/orion-window.block"
import { ReturnFutureBlock } from "./nasa-artemis-ii/return-future.block"
import { SourcesBlock } from "./nasa-artemis-ii/sources.block"
import { SystemIgnitionBlock } from "./nasa-artemis-ii/system-ignition.block"

export default function NasaArtemisIiArtifact() {
  return (
    <Artifact title="Artemis II: Returning to Lunar Space">
      <Block id="orion-window" title="Orion Window">
        <OrionWindowBlock />
      </Block>

      <Block id="crew-manifest" title="Crew Manifest">
        <CrewManifestBlock />
      </Block>

      <Block id="system-ignition" title="System Ignition">
        <SystemIgnitionBlock />
      </Block>

      <Block id="mission-route" title="Mission Route">
        <MissionRouteBlock />
      </Block>

      <Block id="lunar-flyby" title="Lunar Flyby">
        <LunarFlybyBlock />
      </Block>

      <Block id="return-future" title="Return And Future">
        <ReturnFutureBlock />
      </Block>

      <Block id="sources" title="Sources">
        <SourcesBlock />
      </Block>
    </Artifact>
  )
}
