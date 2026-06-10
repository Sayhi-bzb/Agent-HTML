import { Badge } from "../../components/ui/badge"

import { taxiData } from "./data"
import {
  MetricStrip,
  ScratchLine,
  SketchNote,
  SketchPanel,
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
            <Badge variant="secondary">official data / sketch mode</Badge>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground md:text-5xl">
              纽约黄出租，一个月的城市笔记。
            </h1>
            <p className="canvas-text-body text-muted-foreground">
              这不是虚构经营案例，也不是品牌故事。这里用 NYC TLC 2024 年 10
              月 Yellow Taxi Trip Record Data，把 367 万次清洗后行程压成一份可读的数据草稿。
            </p>
          </div>
          <ScratchLine />
          <SketchNote label="data cut">
            原始 {formatCompact(kpis.rawTrips)}
            行；过滤时间越界、无效区域、非正金额/里程和极端值后保留{" "}
            {formatCompact(kpis.keptTrips)} 行。口径固定为 {meta.month}。
          </SketchNote>
        </div>

        <SketchPanel>
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="canvas-text-caption text-muted-foreground">
                  median trip
                </p>
                <p className="font-mono text-xl">{kpis.medianDistance} mi</p>
              </div>
              <div>
                <p className="canvas-text-caption text-muted-foreground">
                  median total
                </p>
                <p className="font-mono text-xl">
                  {formatCurrency(kpis.medianTotal)}
                </p>
              </div>
              <div>
                <p className="canvas-text-caption text-muted-foreground">
                  card tip rate
                </p>
                <p className="font-mono text-xl">{kpis.cardTipRate}%</p>
              </div>
            </div>
            <p className="canvas-text-caption text-muted-foreground">
              TLC 的 tip_amount 主要记录刷卡小费；现金小费不会完整进入这个字段。
            </p>
          </div>
        </SketchPanel>
      </div>

      <MetricStrip
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
