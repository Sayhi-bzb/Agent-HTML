import { ActivityIcon, FilterIcon, SlidersHorizontalIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Slider } from "../../components/ui/slider"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../components/ui/toggle-group"
import type { UsageDashboardRow } from "../../lib/usage-dashboard"

import {
  formatCurrency,
  formatNumber,
  metricViewLabels,
  type UsageMetricView,
  type UsageSummary,
  type UsageWindow,
  windowLabels,
} from "./data"

type ControlsBlockProps = {
  maxRequests: number
  metricView: UsageMetricView
  requestThreshold: number
  setMetricView: (view: UsageMetricView) => void
  setRequestThreshold: (threshold: number) => void
  setWindow: (window: UsageWindow) => void
  summary: UsageSummary
  visibleRows: UsageDashboardRow[]
  window: UsageWindow
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="canvas-content-panel-sm canvas-stack-xs min-w-0">
      <span className="canvas-text-caption text-muted-foreground">{label}</span>
      <span className="canvas-text-body">{value}</span>
    </div>
  )
}

export function ControlsBlock({
  maxRequests,
  metricView,
  requestThreshold,
  setMetricView,
  setRequestThreshold,
  setWindow,
  summary,
  visibleRows,
  window,
}: ControlsBlockProps) {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">
            <SlidersHorizontalIcon data-icon="inline-start" />
            interactive
          </Badge>
          <Badge variant="outline">{visibleRows.length} rows</Badge>
        </div>
        <h2 className="canvas-text-title">Usage analytics controls</h2>
        <p className="canvas-text-body text-muted-foreground">
          Change the window, metric lens, or request threshold and every block
          updates from the same artifact state.
        </p>
      </div>

      <div className="canvas-grid-gap lg:grid-cols-3">
        <div className="canvas-content-panel canvas-stack-sm">
          <div className="canvas-wrap-sm items-center">
            <FilterIcon data-icon="inline-start" />
            <span className="canvas-text-body">Time window</span>
          </div>
          <Select
            onValueChange={(value) => setWindow(value as UsageWindow)}
            value={window}
          >
            <SelectTrigger aria-label="Usage window">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">{windowLabels["6"]}</SelectItem>
              <SelectItem value="12">{windowLabels["12"]}</SelectItem>
              <SelectItem value="24">{windowLabels["24"]}</SelectItem>
              <SelectItem value="all">{windowLabels.all}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="canvas-content-panel canvas-stack-sm">
          <div className="canvas-wrap-sm items-center">
            <ActivityIcon data-icon="inline-start" />
            <span className="canvas-text-body">Metric view</span>
          </div>
          <ToggleGroup
            onValueChange={(value) => {
              if (value === "traffic" || value === "tokens" || value === "cost") {
                setMetricView(value)
              }
            }}
            type="single"
            value={metricView}
            variant="outline"
          >
            <ToggleGroupItem value="traffic">
              {metricViewLabels.traffic}
            </ToggleGroupItem>
            <ToggleGroupItem value="tokens">
              {metricViewLabels.tokens}
            </ToggleGroupItem>
            <ToggleGroupItem value="cost">{metricViewLabels.cost}</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="canvas-content-panel canvas-stack-sm">
          <div className="canvas-wrap-sm items-center justify-between">
            <span className="canvas-text-body">Request threshold</span>
            <Badge variant="outline">{formatNumber(requestThreshold)}</Badge>
          </div>
          <Slider
            aria-label="Request threshold"
            max={maxRequests}
            min={0}
            onValueChange={(value) => setRequestThreshold(value[0] ?? 0)}
            step={1}
            value={[requestThreshold]}
          />
        </div>
      </div>

      <div className="canvas-grid-gap md:grid-cols-4">
        <SummaryMetric
          label="Requests"
          value={formatNumber(summary.requestTotal)}
        />
        <SummaryMetric label="Tokens" value={formatNumber(summary.tokenTotal)} />
        <SummaryMetric
          label="Peak users"
          value={formatNumber(summary.userPeak)}
        />
        <SummaryMetric label="Cost" value={formatCurrency(summary.averageCost)} />
      </div>
    </section>
  )
}
