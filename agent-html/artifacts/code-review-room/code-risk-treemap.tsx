import { StatusBadge } from "../../components/ui/status-badge"
import type { CodeMetricRow, RiskFile } from "./data/types"

type CodeRiskTreemapProps = {
  metrics: CodeMetricRow[]
  risks: RiskFile[]
}

function riskForMetric(row: CodeMetricRow, risks: RiskFile[]) {
  return risks.find((risk) => risk.file === row.module)
}

function areaClass(row: CodeMetricRow) {
  if (row.loc > 1200) {
    return "col-span-6 row-span-3"
  }

  if (row.loc > 800) {
    return "col-span-3 row-span-3"
  }

  if (row.loc > 300) {
    return "col-span-3 row-span-2"
  }

  return "col-span-2 row-span-2"
}

function heatClass(row: CodeMetricRow) {
  if (row.mi < 35 && row.cyclomatic > 100) {
    return "bg-destructive/35"
  }

  if (row.mi < 45 || row.cognitive > 40) {
    return "bg-chart-3/35"
  }

  return "bg-chart-1/25"
}

function statusForMetric(row: CodeMetricRow) {
  if (row.mi < 35 && row.cyclomatic > 100) {
    return "destructive" as const
  }

  if (row.mi < 45 || row.cognitive > 40) {
    return "warning" as const
  }

  return "success" as const
}

function pressureLabel(row: CodeMetricRow) {
  if (row.mi < 35 && row.cyclomatic > 100) {
    return "hot"
  }

  if (row.mi < 45 || row.cognitive > 40) {
    return "warm"
  }

  return "watch"
}

export function CodeRiskTreemap({ metrics, risks }: CodeRiskTreemapProps) {
  return (
    <div className="canvas-stack-sm">
      <div className="grid min-h-80 auto-rows-[4.5rem] grid-cols-6 gap-3">
        {metrics.map((row) => {
          const risk = riskForMetric(row, risks)

          return (
            <article
              className={`${areaClass(row)} ${heatClass(row)} flex min-w-0 flex-col justify-between overflow-hidden rounded-md p-3`}
              key={row.module}
            >
              <title>
                {`${row.name} @ ${row.module}
MI ${row.mi}  CC ${row.cyclomatic}  Cog ${row.cognitive}  Nest ${row.nesting}
LOC ${row.loc}  H.Vol ${row.vol}  H.Diff ${row.diff}
Fan-in ${row.fanIn}  Fan-out ${row.fanOut}
${risk?.consequence ?? ""}`}
              </title>
              <div className="canvas-stack-xs min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate font-mono text-xs tracking-normal">
                    {row.name}
                  </p>
                  <StatusBadge status={statusForMetric(row)}>
                    {pressureLabel(row)}
                  </StatusBadge>
                </div>
                <p className="line-clamp-2 canvas-text-caption text-muted-foreground">
                  {risk?.consequence ?? row.module}
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-sm bg-background/70 px-1.5 py-0.5 font-mono text-[0.68rem] tracking-normal">
                  MI {row.mi}
                </span>
                <span className="rounded-sm bg-background/70 px-1.5 py-0.5 font-mono text-[0.68rem] tracking-normal">
                  CC {row.cyclomatic}
                </span>
                <span className="rounded-sm bg-background/70 px-1.5 py-0.5 font-mono text-[0.68rem] tracking-normal">
                  Out {row.fanOut}
                </span>
                {risk ? (
                  <span className="rounded-sm bg-background/70 px-1.5 py-0.5 text-[0.68rem]">
                    {risk.type}
                  </span>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge status="destructive">large and complex</StatusBadge>
        <StatusBadge status="warning">high review pressure</StatusBadge>
        <StatusBadge status="success">watch candidate</StatusBadge>
      </div>
    </div>
  )
}
