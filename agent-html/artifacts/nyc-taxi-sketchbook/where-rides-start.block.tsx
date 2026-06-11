import type { ColumnDef } from "@tanstack/react-table"

import { DataTable, DataTableColumnHeader } from "../../components/data-table"

import { taxiData } from "./data"
import { roughSketchChartStyle } from "./rough-theme"
import { RoughBarHChart } from "./rough-viz-charts"
import {
  LedgerRows,
  SectionIntro,
  SketchNote,
  SketchPanel,
  formatCompact,
  formatPercent,
} from "./sketch-components"

const zoneRows = taxiData.pickupZones.slice(0, 10).map((zone) => ({
  ...zone,
  shortZone: zone.zone.replace("Midtown ", "M. "),
}))
const zoneChartData = {
  labels: zoneRows.map((zone) => zone.shortZone),
  values: zoneRows.map((zone) => zone.trips),
}

type PickupZoneRow = {
  averageDistance: number
  averageTotal: number
  borough: string
  trips: number
  zone: string
}

const pickupZoneTableRows: PickupZoneRow[] = taxiData.pickupZones.map((zone) => ({
  averageDistance: zone.averageDistance,
  averageTotal: zone.averageTotal,
  borough: zone.borough,
  trips: zone.trips,
  zone: zone.zone,
}))

const pickupZoneColumns: ColumnDef<PickupZoneRow>[] = [
  {
    accessorKey: "zone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="zone" />
    ),
  },
  {
    accessorKey: "borough",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="borough" />
    ),
  },
  {
    accessorKey: "trips",
    cell: ({ row }) => (
      <span className="font-mono">{formatCompact(row.original.trips)}</span>
    ),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="trips" />
    ),
  },
  {
    accessorKey: "averageTotal",
    cell: ({ row }) => (
      <span className="font-mono">${row.original.averageTotal}</span>
    ),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="avg total" />
    ),
  },
  {
    accessorKey: "averageDistance",
    cell: ({ row }) => (
      <span className="font-mono">{row.original.averageDistance} mi</span>
    ),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="avg distance" />
    ),
  },
]

export function WhereRidesStartBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="02 / pickup geography" title="Pickups still cluster in Manhattan and at airports">
        High-frequency pickups are not evenly spread across the city. Core
        Manhattan zones supply short-hop density, while airport zones lift
        distance and fare totals.
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-2">
        <SketchPanel>
          <RoughBarHChart
            {...roughSketchChartStyle}
            axisFontSize=".78rem"
            color="var(--chart-1)"
            data={zoneChartData}
            heightClassName="min-h-[420px] [&_svg]:min-h-[420px]"
            margin={{ top: 44, right: 28, bottom: 52, left: 150 }}
            title="Top pickup zones"
            titleFontSize="17px"
            tooltipFontSize=".8rem"
            xValueFormat=".2s"
          />
        </SketchPanel>

        <div className="canvas-stack-md">
          <LedgerRows
            items={taxiData.pickupBoroughs.map((borough) => ({
              label: borough.borough,
              note: `${formatPercent(borough.share)} of pickups`,
              value: formatCompact(borough.trips),
            }))}
          />
          <SketchNote>
            Manhattan leads as expected; Queens and EWR are the sharper read
            because they pull long airport trips into the fare structure.
          </SketchNote>
        </div>
      </div>

      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-end justify-between">
          <div className="canvas-stack-xs">
            <h3 className="canvas-text-subheading">Top pickup zones, inspectable</h3>
            <p className="canvas-text-caption text-muted-foreground">
              This table uses the same official aggregate, with searchable
              zones and sortable trip, total, and distance fields.
            </p>
          </div>
        </div>
        <DataTable
          columns={pickupZoneColumns}
          data={pickupZoneTableRows}
          emptyLabel="No pickup zones."
          getRowId={(row) => `${row.borough}-${row.zone}`}
          searchColumn="zone"
          searchPlaceholder="Filter pickup zone..."
        />
      </div>
    </section>
  )
}
