import { CodeBlock } from "../../components/code-block"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import type { UsageDashboardRow } from "../../lib/usage-dashboard"

import {
  formatCurrency,
  formatDuration,
  formatNumber,
  rowToPayload,
} from "./data"

type InspectorBlockProps = {
  selectedRow: UsageDashboardRow | null
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

export function InspectorBlock({ selectedRow }: InspectorBlockProps) {
  const payload = JSON.stringify(rowToPayload(selectedRow), null, 2)
  const tokensPerRequest = selectedRow?.requests
    ? selectedRow.tokens / selectedRow.requests
    : 0

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">inspector</Badge>
          {selectedRow ? <Badge variant="outline">{selectedRow.hour}</Badge> : null}
        </div>
        <h2 className="canvas-text-heading">Selected record</h2>
        <p className="canvas-text-body text-muted-foreground">
          The inspector updates from chart clicks and data-table row clicks.
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
            value={formatNumber(tokensPerRequest)}
          />
        </div>
      ) : (
        <div className="canvas-content-panel">
          <p className="canvas-text-body text-muted-foreground">
            Select a row from the chart or table.
          </p>
        </div>
      )}

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
