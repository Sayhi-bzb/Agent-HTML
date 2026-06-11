import { Badge } from "../../components/ui/badge"

import { taxiData } from "./data"
import {
  LedgerRows,
  SketchNote,
  formatCompact,
  formatCurrency,
} from "./sketch-components"

export function TaxiHeaderBlock() {
  const { kpis, meta } = taxiData

  return (
    <section className="canvas-stack-lg">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="canvas-stack-md">
          <div className="canvas-stack-sm">
            <Badge variant="secondary">NYC TLC / October 2024</Badge>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-5xl">
              纽约黄出租，一个月的行程账本。
            </h1>
            <p className="canvas-text-body text-muted-foreground">
              NYC TLC Yellow Taxi Trip Record Data，清洗后保留 367 万次行程。
              这页只看上车时间、地点、费用和机场长距离行程如何改变均值。
            </p>
          </div>
          <SketchNote label="data cut">
            原始 {formatCompact(kpis.rawTrips)}
            行；过滤时间越界、无效区域、非正金额/里程和极端值后保留{" "}
            {formatCompact(kpis.keptTrips)} 行。口径固定为 {meta.month}。
          </SketchNote>
        </div>

        <div className="canvas-stack-md">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="canvas-text-caption text-muted-foreground">
                recorded total amount
              </p>
              <p className="font-mono text-4xl font-semibold tracking-normal">
                {formatCurrency(kpis.totalAmount)}
              </p>
            </div>
            <Badge variant="outline">{meta.vehicle}</Badge>
          </div>
          <LedgerRows
            items={[
              {
                label: "median trip",
                value: `${kpis.medianDistance} mi`,
              },
              {
                label: "median total",
                value: formatCurrency(kpis.medianTotal),
              },
              {
                label: "card tip rate",
                note: "cash tips are not fully captured",
                value: `${kpis.cardTipRate}%`,
              },
            ]}
          />
        </div>
      </div>

      <LedgerRows
        items={[
          {
            label: "clean trips",
            value: formatCompact(kpis.keptTrips),
            note: "after filters",
          },
          {
            label: "avg total",
            value: formatCurrency(kpis.averageTotal),
            note: "fare + fees + tip",
          },
          {
            label: "avg distance",
            value: `${kpis.averageDistance} mi`,
            note: "mean trip_distance",
          },
          {
            label: "avg passenger",
            value: String(kpis.averagePassengers),
            note: "reported count",
          },
        ]}
      />
    </section>
  )
}
