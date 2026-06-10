import type { ColumnDef } from "@tanstack/react-table"

import { DataTable, DataTableColumnHeader } from "../../components/data-table"

import { taxiData } from "./data"
import { RoughBarHChart } from "./rough-viz-charts"
import {
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
      <SectionIntro badge="02 / pickup geography" title="上车点先把故事写偏了。">
        黄出租的一个月不是全城均匀分布。高频 pickup 仍然被曼哈顿核心区、机场和几个交通节点拉住。
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-2">
        <SketchPanel>
          <RoughBarHChart
            axisFontSize=".78rem"
            axisRoughness={1}
            axisStrokeWidth={1}
            color="var(--chart-1)"
            data={zoneChartData}
            fillStyle="hachure"
            fillWeight={1}
            heightClassName="min-h-[420px] [&_svg]:min-h-[420px]"
            innerStrokeWidth={1}
            margin={{ top: 44, right: 28, bottom: 52, left: 150 }}
            roughness={2}
            stroke="black"
            strokeWidth={1}
            title="Top pickup zones"
            titleFontSize="17px"
            tooltipFontSize=".8rem"
            xValueFormat=".2s"
          />
        </SketchPanel>

        <div className="canvas-stack-md">
          <SketchPanel>
            <div className="canvas-stack-sm">
              {taxiData.pickupBoroughs.map((borough) => (
                <div className="grid grid-cols-3 items-baseline gap-3" key={borough.borough}>
                  <span className="canvas-text-caption text-muted-foreground">
                    {borough.borough}
                  </span>
                  <strong className="font-mono">
                    {formatCompact(borough.trips)}
                  </strong>
                  <span className="text-right font-mono text-sm">
                    {formatPercent(borough.share)}
                  </span>
                </div>
              ))}
            </div>
          </SketchPanel>
          <SketchNote>
            Manhattan 占比最高不意外；更值得看的是 Queens 和 EWR，它们把机场长距离行程带进费用结构。
          </SketchNote>
        </div>
      </div>

      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-end justify-between">
          <div className="canvas-stack-xs">
            <h3 className="canvas-text-subheading">Top pickup zones, inspectable</h3>
            <p className="canvas-text-caption text-muted-foreground">
              这张表直接使用同一份官方聚合数据，可搜索 zone、排序行程数和均值字段。
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
