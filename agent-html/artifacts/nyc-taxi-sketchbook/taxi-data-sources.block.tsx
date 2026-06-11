import { Alert, AlertDescription } from "../../components/ui/alert"

import { taxiData } from "./data"
import { LedgerRows, SectionIntro } from "./sketch-components"

const taxiDataSources = [
  {
    label: "NYC TLC Trip Record Data",
    note: "Official monthly taxi trip data page.",
    url: "https://www.nyc.gov/site/tlc/about/tlc-trip-record-data.page",
  },
  {
    label: "Yellow Taxi Data Dictionary",
    note: "Field definitions for time, location, fare, payment, and tip fields.",
    url: "https://www.nyc.gov/assets/tlc/downloads/pdf/data_dictionary_trip_records_yellow.pdf",
  },
  {
    label: "yellow_tripdata_2024-10.parquet",
    note: "Raw monthly Parquet file used by this artifact.",
    url: taxiData.meta.generatedFrom,
  },
  {
    label: "Taxi zone lookup",
    note: "Official LocationID mapping to borough, zone, and service zone.",
    url: taxiData.meta.zoneLookup,
  },
]

export function TaxiDataSourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="taxi data sources" title="Data sources and cleaning rules">
        Charts on this page come from local aggregates of official TLC raw
        data. No trips are fabricated, and the original Parquet file is not
        committed.
      </SectionIntro>

      <LedgerRows
        items={taxiDataSources.map((source) => ({
          label: source.label,
          note: source.note,
          value: (
            <a className="canvas-text-caption underline" href={source.url}>
              {source.url}
            </a>
          ),
        }))}
      />

      <Alert>
        <AlertDescription>
          Cleaning rules: {taxiData.meta.filters} {taxiData.meta.note}
        </AlertDescription>
      </Alert>
    </section>
  )
}
