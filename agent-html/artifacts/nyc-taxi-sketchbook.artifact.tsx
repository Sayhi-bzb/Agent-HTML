import { Artifact, Block } from "@agent-html/react"

import { AirportRidesBlock } from "./nyc-taxi-sketchbook/airport-rides.block"
import { CityRhythmBlock } from "./nyc-taxi-sketchbook/city-rhythm.block"
import { FareAnatomyBlock } from "./nyc-taxi-sketchbook/fare-anatomy.block"
import { FlowMatrixBlock } from "./nyc-taxi-sketchbook/flow-matrix.block"
import { TaxiHeaderBlock } from "./nyc-taxi-sketchbook/header.block"
import { SourcesBlock } from "./nyc-taxi-sketchbook/sources.block"
import { WhereRidesStartBlock } from "./nyc-taxi-sketchbook/where-rides-start.block"

export default function NycTaxiSketchbookArtifact() {
  return (
    <Artifact title="NYC Taxi Data Sketchbook">
      <Block id="taxi-header" title="NYC Taxi Data Sketchbook">
        <TaxiHeaderBlock />
      </Block>

      <Block id="city-rhythm" title="City Rhythm">
        <CityRhythmBlock />
      </Block>

      <Block id="where-rides-start" title="Where Rides Start">
        <WhereRidesStartBlock />
      </Block>

      <Block id="flow-matrix" title="Flow Matrix">
        <FlowMatrixBlock />
      </Block>

      <Block id="fare-anatomy" title="Fare Anatomy">
        <FareAnatomyBlock />
      </Block>

      <Block id="airport-rides" title="Airport Rides">
        <AirportRidesBlock />
      </Block>

      <Block id="source-register" title="Source Register">
        <SourcesBlock />
      </Block>
    </Artifact>
  )
}
