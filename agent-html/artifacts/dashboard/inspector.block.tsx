import { CodeBlock } from "../../components/code-block"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"

import {
  formatCurrency,
  formatDuration,
  formatNumber,
  getSeverityLabel,
  rowToPayload,
  type DashboardSignalRow,
  type DashboardSummary,
} from "./data"

type InspectorBlockProps = {
  selectedRow: DashboardSignalRow | null
  summary: DashboardSummary
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="canvas-content-panel-sm canvas-stack-xs min-w-0">
      <span className="canvas-text-caption text-muted-foreground">{label}</span>
      <span className="canvas-text-body">{value}</span>
    </div>
  )
}

export function InspectorBlock({ selectedRow, summary }: InspectorBlockProps) {
  const payload = JSON.stringify(rowToPayload(selectedRow), null, 2)
  const severityVariant =
    selectedRow?.severity === "critical"
      ? "destructive"
      : selectedRow?.severity === "watch"
        ? "secondary"
        : "outline"

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          {selectedRow ? (
            <>
              <Badge variant={severityVariant}>
                {getSeverityLabel(selectedRow.severity)}
              </Badge>
              <Badge variant="outline">{selectedRow.hour}</Badge>
              {selectedRow.thresholdExceeded ? (
                <Badge variant="destructive">threshold hit</Badge>
              ) : null}
            </>
          ) : (
            <Badge variant="outline">No selected hour</Badge>
          )}
        </div>
        <h2 className="canvas-text-heading">Selected-hour decision</h2>
        <p className="canvas-text-body text-muted-foreground">
          The active row is interpreted against the filtered window baseline and
          converted into a concrete operations action.
        </p>
      </div>

      {selectedRow ? (
        <div className="canvas-grid-gap md:grid-cols-3">
          <Detail label="Requests" value={formatNumber(selectedRow.requests)} />
          <Detail label="Tokens" value={formatNumber(selectedRow.tokens)} />
          <Detail label="Users" value={formatNumber(selectedRow.users)} />
          <Detail
            label="Duration"
            value={formatDuration(selectedRow.durationSeconds)}
          />
          <Detail label="Cost" value={formatCurrency(selectedRow.cost)} />
          <Detail
            label="Tokens/request"
            value={formatNumber(selectedRow.tokensPerRequest)}
          />
          <Detail
            label="Cost/request"
            value={formatCurrency(selectedRow.costPerRequest)}
          />
          <Detail
            label="Pressure"
            value={`${selectedRow.metricScore}%`}
          />
        </div>
      ) : (
        <div className="canvas-content-panel">
          <p className="canvas-text-body text-muted-foreground">
            Select a row from the chart or table.
          </p>
        </div>
      )}

      {selectedRow ? (
        <div className="canvas-grid-gap lg:grid-cols-2">
          <div className="canvas-content-panel-sm canvas-stack-sm">
            <span className="canvas-text-body">Local explanation</span>
            <p className="canvas-text-body text-muted-foreground">
              {selectedRow.anomalyReasons.length > 0
                ? selectedRow.anomalyReasons.join(". ")
                : `${selectedRow.hour} is within the current ${summary.healthLabel.toLowerCase()} operating envelope.`}
            </p>
          </div>
          <div className="canvas-content-panel-sm canvas-stack-sm">
            <span className="canvas-text-body">Next action</span>
            <p className="canvas-text-body text-muted-foreground">
              {selectedRow.nextAction}
            </p>
          </div>
        </div>
      ) : null}

      <Separator />

      <CodeBlock
        caption="Derived from the selected local CSV record."
        code={payload}
        language="json"
        showLineNumbers
        title="Selected usage row"
      />
    </section>
  )
}
