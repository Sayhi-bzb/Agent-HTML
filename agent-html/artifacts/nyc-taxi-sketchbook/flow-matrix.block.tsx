import { taxiData } from "./data"
import { SectionIntro, SketchNote, SketchPanel, formatCompact } from "./sketch-components"

const boroughs = ["Manhattan", "Queens", "Brooklyn", "Bronx", "EWR"]
const matrixRows = boroughs.map((from) =>
  boroughs.map((to) => {
    return (
      taxiData.od.find((item) => item.from === from && item.to === to) ?? {
        averageDistance: 0,
        averageTotal: 0,
        from,
        to,
        trips: 0,
      }
    )
  })
)
const maxTrips = Math.max(...matrixRows.flat().map((item) => item.trips))

function opacityClass(trips: number) {
  if (!trips) return "opacity-10"
  const ratio = trips / maxTrips
  if (ratio > 0.8) return "opacity-90"
  if (ratio > 0.6) return "opacity-75"
  if (ratio > 0.4) return "opacity-60"
  if (ratio > 0.2) return "opacity-45"
  return "opacity-25"
}

export function FlowMatrixBlock() {
  const strongest = matrixRows
    .flat()
    .filter((item) => item.from !== item.to)
    .sort((a, b) => b.trips - a.trips)[0]

  return (
    <section className="canvas-stack-lg">
      <SectionIntro badge="03 / origin to destination" title="最粗的流向，仍然很短。">
        OD 矩阵把 pickup borough 和 dropoff borough 摊开看。对角线越深，说明行程更多在同一区域内部完成。
      </SectionIntro>

      <div className="grid gap-5 lg:grid-cols-3">
        <SketchPanel className="lg:col-span-2">
          <div className="grid gap-2">
            <div className="grid grid-cols-6 gap-2">
              <span />
              {boroughs.map((borough) => (
                <span className="canvas-text-caption text-muted-foreground" key={borough}>
                  {borough}
                </span>
              ))}
            </div>
            {matrixRows.map((row, index) => (
              <div className="grid grid-cols-6 gap-2" key={boroughs[index]}>
                <span className="canvas-text-caption text-muted-foreground">
                  {boroughs[index]}
                </span>
                {row.map((item) => (
                  <div
                    className={`min-h-20 rounded-sm border border-border bg-foreground p-2 text-background ${opacityClass(item.trips)}`}
                    key={`${item.from}-${item.to}`}
                  >
                    <p className="font-mono text-sm">{formatCompact(item.trips)}</p>
                    <p className="text-xs">{item.averageDistance} mi</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </SketchPanel>

        <div className="canvas-stack-md">
          <SketchPanel>
            <div className="canvas-stack-xs">
              <span className="canvas-text-caption text-muted-foreground">
                strongest cross-borough line
              </span>
              <strong className="font-mono text-2xl">
                {strongest.from} {"->"} {strongest.to}
              </strong>
              <p className="canvas-text-body">
                {formatCompact(strongest.trips)} 次，平均 {strongest.averageDistance}{" "}
                mi，平均总额 ${strongest.averageTotal}。
              </p>
            </div>
          </SketchPanel>
          <SketchNote>
            这张图故意只放主要 borough。它不是地图，而是看“出租车到底是在跨城移动，还是在核心区内循环”。
          </SketchNote>
        </div>
      </div>
    </section>
  )
}
