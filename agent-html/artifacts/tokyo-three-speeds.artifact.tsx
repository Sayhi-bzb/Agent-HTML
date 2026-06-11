import { Artifact, Block } from "@agent-html/react"

import { HighDensityRouteBlock } from "./tokyo-three-speeds/high-density-route.block"
import { MediaSourcesBlock } from "./tokyo-three-speeds/media-sources.block"
import { OpenLoopNotesBlock } from "./tokyo-three-speeds/open-loop-notes.block"
import { QuietRouteBlock } from "./tokyo-three-speeds/quiet-route.block"
import { RoutePlannerBlock } from "./tokyo-three-speeds/route-planner.block"
import { SoftLandingBlock } from "./tokyo-three-speeds/soft-landing.block"
import { SpeedOverviewBlock } from "./tokyo-three-speeds/speed-overview.block"

export default function TokyoThreeSpeedsArtifact() {
  return (
    <Artifact title="Three Speeds of Tokyo">
      <Block id="speed-overview" title="Speed Overview">
        <SpeedOverviewBlock />
      </Block>

      <Block id="route-planner" title="Route Planner">
        <RoutePlannerBlock />
      </Block>

      <Block id="soft-landing" title="Soft Landing">
        <SoftLandingBlock />
      </Block>

      <Block id="high-density-route" title="High Density Route">
        <HighDensityRouteBlock />
      </Block>

      <Block id="quiet-route" title="Quiet Route">
        <QuietRouteBlock />
      </Block>

      <Block id="open-loop-notes" title="Open Loop Notes">
        <OpenLoopNotesBlock />
      </Block>

      <Block id="media-sources" title="Media Sources">
        <MediaSourcesBlock />
      </Block>
    </Artifact>
  )
}
