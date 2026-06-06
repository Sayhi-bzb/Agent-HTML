import { CodeBlock } from "../../components/code-block"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import type { UsageDashboardRow } from "../../lib/usage-dashboard"

import {
  formatCurrency,
  formatNumber,
  formatRatio,
  formatSeconds,
  rowSnapshot,
  type UsageSummary,
} from "./data"

type InspectorBlockProps = {
  requestThreshold: number
  selectedRow: UsageDashboardRow | null
  summary: UsageSummary
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="canvas-content-panel-sm canvas-stack-xs min-w-0">
      <span className="canvas-text-caption text-muted-foreground">{label}</span>
      <span className="canvas-text-body">{value}</span>
    </div>
  )
}

export function InspectorBlock({
  requestThreshold,
  selectedRow,
  summary,
}: InspectorBlockProps) {
  const selectedJson = JSON.stringify(rowSnapshot(selectedRow), null, 2)
  const tokensPerRequest = selectedRow?.requests
    ? selectedRow.tokens / selectedRow.requests
    : 0
  const costPerUser = selectedRow?.users ? selectedRow.cost / selectedRow.users : 0
  const overThreshold = selectedRow
    ? selectedRow.requests >= requestThreshold
    : false

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">inspector</Badge>
          {overThreshold ? <Badge>above threshold</Badge> : null}
        </div>
        <h2 className="canvas-text-heading">Selected row details</h2>
        <p className="canvas-text-body text-muted-foreground">
          The inspector derives ratios and source JSON from the row selected in
          the chart or table.
        </p>
      </div>

      {selectedRow ? (
        <div className="canvas-grid-gap md:grid-cols-3">
          <DetailMetric label="Hour" value={selectedRow.hour} />
          <DetailMetric
            label="Requests"
            value={formatNumber(selectedRow.requests)}
          />
          <DetailMetric label="Users" value={formatNumber(selectedRow.users)} />
          <DetailMetric
            label="Tokens"
            value={formatNumber(selectedRow.tokens)}
          />
          <DetailMetric
            label="Duration"
            value={formatSeconds(selectedRow.durationSeconds)}
          />
          <DetailMetric label="Cost" value={formatCurrency(selectedRow.cost)} />
          <DetailMetric
            label="Tokens/request"
            value={formatRatio(tokensPerRequest)}
          />
          <DetailMetric label="Cost/user" value={formatCurrency(costPerUser)} />
          <DetailMetric
            label="Window avg requests"
            value={formatNumber(summary.averageRequests)}
          />
        </div>
      ) : (
        <div className="canvas-content-panel">
          <p className="canvas-text-body text-muted-foreground">
            No usage row is selected.
          </p>
        </div>
      )}

      <Separator />

      <CodeBlock
        caption="This is generated inside the artifact from the selected row."
        code={selectedJson}
        language="json"
        showLineNumbers
        title="Selected usage payload"
      />
    </section>
  )
}
