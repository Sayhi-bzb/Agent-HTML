import { Artifact, Block } from "@agent-html/react"

import { AirportRidesBlock } from "./nyc-taxi-sketchbook/airport-rides.block"
import { BoroughFlowNetworkBlock } from "./nyc-taxi-sketchbook/borough-flow-network.block"
import { CityRhythmBlock } from "./nyc-taxi-sketchbook/city-rhythm.block"
import { FareAnatomyBlock } from "./nyc-taxi-sketchbook/fare-anatomy.block"
import { TaxiDataSourcesBlock } from "./nyc-taxi-sketchbook/taxi-data-sources.block"
import { TripLedgerOverviewBlock } from "./nyc-taxi-sketchbook/trip-ledger-overview.block"
import { WhereRidesStartBlock } from "./nyc-taxi-sketchbook/where-rides-start.block"

export default function NycTaxiSketchbookArtifact() {
  return (
    <Artifact title="NYC Taxi Data Sketchbook">
      <Block id="trip-ledger-overview" title="Trip Ledger Overview">
        <TripLedgerOverviewBlock />
      </Block>

      <Block id="city-rhythm" title="City Rhythm">
        <CityRhythmBlock />
      </Block>

      <Block id="where-rides-start" title="Where Rides Start">
        <WhereRidesStartBlock />
      </Block>

      <Block id="borough-flow-network" title="Borough Flow Network">
        <BoroughFlowNetworkBlock />
      </Block>

      <Block id="fare-anatomy" title="Fare Anatomy">
        <FareAnatomyBlock />
      </Block>

      <Block id="airport-rides" title="Airport Rides">
        <AirportRidesBlock />
      </Block>

      <Block id="taxi-data-sources" title="Taxi Data Sources">
        <TaxiDataSourcesBlock />
      </Block>
    </Artifact>
  )
}
