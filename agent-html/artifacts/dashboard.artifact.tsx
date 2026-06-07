import { useMemo, useState } from "react"
import { Artifact, Block } from "@agent-html/react"

import usageCsv from "../data/public.usage_dashboard_hourly.csv?raw"
import { parseUsageDashboardCsv } from "../lib/usage-dashboard"

import { ControlsBlock } from "./dashboard/controls.block"
import {
  buildDashboardSignals,
  filterDashboardSignals,
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
  const [thresholdPercent, setThresholdPercent] = useState(70)
  const [anomalyOnly, setAnomalyOnly] = useState(false)
  const [selectedRowKey, setSelectedRowKey] = useState(
    initialSelectedRow?.bucketStart ?? ""
  )
  const rows = useMemo(() => selectDashboardWindow(usageRows, window), [window])
  const signalRows = useMemo(
    () => buildDashboardSignals(rows, metric, thresholdPercent),
    [metric, rows, thresholdPercent]
  )
  const filteredRows = useMemo(
    () => filterDashboardSignals(signalRows, anomalyOnly),
    [anomalyOnly, signalRows]
  )
  const summary = useMemo(() => summarizeDashboardRows(filteredRows), [filteredRows])
  const selectedRow =
    findDashboardRow(filteredRows, selectedRowKey) ??
    filteredRows.at(-1) ??
    null

  return (
    <Artifact title="Operations Dashboard">
      <Block id="overview" title="Overview">
        <OverviewBlock
          anomalyOnly={anomalyOnly}
          metric={metric}
          rows={filteredRows}
          selectedRow={selectedRow}
          summary={summary}
          thresholdPercent={thresholdPercent}
          window={window}
        />
      </Block>

      <Block id="controls" title="Controls">
        <ControlsBlock
          anomalyOnly={anomalyOnly}
          filteredRowCount={filteredRows.length}
          metric={metric}
          setAnomalyOnly={setAnomalyOnly}
          setMetric={setMetric}
          setThresholdPercent={setThresholdPercent}
          setWindow={setWindow}
          sourceRowCount={signalRows.length}
          thresholdPercent={thresholdPercent}
          window={window}
        />
      </Block>

      <Block id="trend" title="Trend">
        <TrendBlock
          metric={metric}
          rows={filteredRows}
          selectedRow={selectedRow}
          setSelectedRowKey={setSelectedRowKey}
          thresholdPercent={thresholdPercent}
        />
      </Block>

      <Block id="records" title="Records">
        <RecordsBlock
          rows={filteredRows}
          selectedRow={selectedRow}
          setSelectedRowKey={setSelectedRowKey}
        />
      </Block>

      <Block id="inspector" title="Inspector">
        <InspectorBlock selectedRow={selectedRow} summary={summary} />
      </Block>
    </Artifact>
  )
}
