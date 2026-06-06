import { useMemo, useState } from "react"
import { Artifact, Block } from "@agent-html/react"

import usageCsv from "../data/public.usage_dashboard_hourly.csv?raw"
import { parseUsageDashboardCsv } from "../lib/usage-dashboard"

import { ControlsBlock } from "./usage-analytics/controls.block"
import {
  defaultRequestThreshold,
  findUsageRow,
  maxRequestCount,
  selectWindowRows,
  summarizeUsageRows,
  type UsageMetricView,
  type UsageWindow,
} from "./usage-analytics/data"
import { InspectorBlock } from "./usage-analytics/inspector.block"
import { RecordsTableBlock } from "./usage-analytics/records-table.block"
import { TrendChartBlock } from "./usage-analytics/trend-chart.block"

const usageRows = parseUsageDashboardCsv(usageCsv)
const initialVisibleRows = selectWindowRows(usageRows, "24")
const initialSelectedRow = initialVisibleRows.at(-1) ?? usageRows.at(-1) ?? null
const initialRequestThreshold = defaultRequestThreshold(initialVisibleRows)

export default function UsageAnalyticsArtifact() {
  const [window, setWindow] = useState<UsageWindow>("24")
  const [metricView, setMetricView] = useState<UsageMetricView>("traffic")
  const [requestThreshold, setRequestThreshold] = useState(
    initialRequestThreshold
  )
  const [selectedRowKey, setSelectedRowKey] = useState(
    initialSelectedRow?.bucketStart ?? ""
  )
  const visibleRows = useMemo(
    () => selectWindowRows(usageRows, window),
    [window]
  )
  const selectedRow =
    findUsageRow(visibleRows, selectedRowKey) ??
    visibleRows.at(-1) ??
    initialSelectedRow
  const summary = useMemo(() => summarizeUsageRows(visibleRows), [visibleRows])
  const maxRequests = maxRequestCount(visibleRows)

  return (
    <Artifact title="Interactive Usage Analytics">
      <Block id="controls" title="Controls">
        <ControlsBlock
          maxRequests={maxRequests}
          metricView={metricView}
          requestThreshold={requestThreshold}
          setMetricView={setMetricView}
          setRequestThreshold={setRequestThreshold}
          setWindow={setWindow}
          summary={summary}
          visibleRows={visibleRows}
          window={window}
        />
      </Block>

      <Block id="trend-chart" title="Trend Chart">
        <TrendChartBlock
          metricView={metricView}
          requestThreshold={requestThreshold}
          selectedRow={selectedRow}
          setSelectedRowKey={setSelectedRowKey}
          visibleRows={visibleRows}
        />
      </Block>

      <Block id="records-table" title="Records Table">
        <RecordsTableBlock
          requestThreshold={requestThreshold}
          selectedRow={selectedRow}
          setSelectedRowKey={setSelectedRowKey}
          visibleRows={visibleRows}
        />
      </Block>

      <Block id="inspector" title="Inspector">
        <InspectorBlock
          requestThreshold={requestThreshold}
          selectedRow={selectedRow}
          summary={summary}
        />
      </Block>
    </Artifact>
  )
}
