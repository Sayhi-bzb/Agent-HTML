import type { ColumnDef } from "@tanstack/react-table"

import { BarHChart } from "../../components/chart/bar-chart"
import { DataTable, DataTableColumnHeader } from "../../components/data-table"

import {
  pickupBoroughs,
  pickupZones,
} from "./data/pickup-geography"
import { roughSketchMarkOptions } from "./rough-theme"
import {
  LedgerRows,
  RoughTableShell,
  SectionIntro,
  SketchNote,
  SketchPanel,
  formatCompact,
  formatPercent,
} from "./sketch-components"

const zoneRows = pickupZones.slice(0, 10).map((zone) => ({
  ...zone,
  shortZone: zone.zone.replace("Midtown ", "M. "),
}))
type PickupZoneRow = {
  averageDistance: number
  averageTotal: number
  borough: string
  trips: number
  zone: string
}

const pickupZoneTableRows: PickupZoneRow[] = pickupZones.map((zone) => ({
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
      <span className="canvas-text-body canvas-text-mono">{formatCompact(row.original.trips)}</span>
    ),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="trips" />
    ),
  },
  {
    accessorKey: "averageTotal",
    cell: ({ row }) => (
      <span className="canvas-text-body canvas-text-mono">${row.original.averageTotal}</span>
    ),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="avg total" />
    ),
  },
  {
    accessorKey: "averageDistance",
    cell: ({ row }) => (
      <span className="canvas-text-body canvas-text-mono">{row.original.averageDistance} mi</span>
    ),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="avg distance" />
    ),
  },
]

export default function WhereRidesStartBlock() {
  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="02 / pickup geography" title="Pickups still cluster in Manhattan and at airports">
        High-frequency pickups are not evenly spread across the city. Core
        Manhattan zones supply short-hop density, while airport zones lift
        distance and fare totals.
      </SectionIntro>

      <div className="canvas-grid-2-lg">
        <SketchPanel>
          <BarHChart
            aspectRatio="4 / 3"
            className="canvas-chart-md"
            data={zoneRows}
            minHeight={420}
            renderer="rough"
            rough={roughSketchMarkOptions}
            xKey="trips"
            xValueFormatter={formatCompact}
            yKey="shortZone"
          />
        </SketchPanel>

        <div className="canvas-stack-md">
          <LedgerRows
            items={pickupBoroughs.map((borough) => ({
              label: borough.borough,
              note: `${formatPercent(borough.share)} of pickups`,
              value: formatCompact(borough.trips),
            }))}
          />
          <SketchNote>
            <span className="text-foreground">Manhattan</span> leads as
            expected; <span className="text-chart-2">Queens and EWR</span> are
            the sharper read because they pull long airport trips into the fare
            structure.
          </SketchNote>
        </div>
      </div>

      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-end justify-between">
          <div className="canvas-stack-xs">
            <h3 className="canvas-text-heading">Top pickup zones, inspectable</h3>
            <p className="canvas-text-caption text-muted-foreground">
              This table uses the same official aggregate, with searchable
              zones and sortable trip, total, and distance fields.
            </p>
          </div>
        </div>
        <RoughTableShell>
          <DataTable
            className="canvas-table-clean-header"
            columns={pickupZoneColumns}
            data={pickupZoneTableRows}
            emptyLabel="No pickup zones."
            getRowId={(row) => `${row.borough}-${row.zone}`}
            rowClassName="border-0"
            searchColumn="zone"
            searchPlaceholder="Filter pickup zone..."
            tableContainerClassName="border-0 bg-transparent"
          />
        </RoughTableShell>
      </div>
    </section>
  )
}
