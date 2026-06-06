import { useMemo, useState } from "react"
import { Artifact, Block } from "@agent-html/react"

import usageCsv from "../data/public.usage_dashboard_hourly.csv?raw"
import { parseUsageDashboardCsv } from "../lib/usage-dashboard"

import { ControlsBlock } from "./dashboard/controls.block"
import {
  findDashboardRow,
  selectDashboardWindow,
  summarizeDashboardRows,
  type DashboardMetric,
  type DashboardWindow,
} from "./dashboard/data"
import { InspectorBlock } from "./dashboard/inspector.block"
import { OverviewBlock } from "./dashboard/overview.block"
import { RecordsBlock } from "./dashboard/records.block"
import { TrendBlock } from "./dashboard/trend.block"

const usageRows = parseUsageDashboardCsv(usageCsv)
const initialRows = selectDashboardWindow(usageRows, "24")
const initialSelectedRow = initialRows.at(-1) ?? usageRows.at(-1) ?? null

export default function DashboardArtifact() {
  const [window, setWindow] = useState<DashboardWindow>("24")
  const [metric, setMetric] = useState<DashboardMetric>("traffic")
  const [selectedRowKey, setSelectedRowKey] = useState(
    initialSelectedRow?.bucketStart ?? ""
  )
  const rows = useMemo(() => selectDashboardWindow(usageRows, window), [window])
  const summary = useMemo(() => summarizeDashboardRows(rows), [rows])
  const selectedRow =
    findDashboardRow(rows, selectedRowKey) ?? rows.at(-1) ?? initialSelectedRow

  return (
    <Artifact title="Dashboard">
      <Block id="overview" title="Overview">
        <OverviewBlock
          metric={metric}
          rows={rows}
          summary={summary}
          window={window}
        />
      </Block>

      <Block id="controls" title="Controls">
        <ControlsBlock
          metric={metric}
          rowCount={rows.length}
          setMetric={setMetric}
          setWindow={setWindow}
          window={window}
        />
      </Block>

      <Block id="trend" title="Trend">
        <TrendBlock
          metric={metric}
          rows={rows}
          selectedRow={selectedRow}
          setSelectedRowKey={setSelectedRowKey}
        />
      </Block>

      <Block id="records" title="Records">
        <RecordsBlock
          rows={rows}
          selectedRow={selectedRow}
          setSelectedRowKey={setSelectedRowKey}
        />
      </Block>

      <Block id="inspector" title="Inspector">
        <InspectorBlock selectedRow={selectedRow} />
      </Block>
    </Artifact>
  )
}
