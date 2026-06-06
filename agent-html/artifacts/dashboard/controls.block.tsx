import { BarChart3Icon, CalendarClockIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../components/ui/toggle-group"

import {
  dashboardMetricLabels,
  dashboardWindowLabels,
  type DashboardMetric,
  type DashboardWindow,
} from "./data"

type ControlsBlockProps = {
  metric: DashboardMetric
  rowCount: number
  setMetric: (metric: DashboardMetric) => void
  setWindow: (window: DashboardWindow) => void
  window: DashboardWindow
}

export function ControlsBlock({
  metric,
  rowCount,
  setMetric,
  setWindow,
  window,
}: ControlsBlockProps) {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">controls</Badge>
          <Badge variant="outline">{rowCount} rows</Badge>
        </div>
        <h2 className="canvas-text-heading">Dashboard controls</h2>
        <p className="canvas-text-body text-muted-foreground">
          Change the reporting window and metric lens. The chart, table, and
          inspector stay linked through artifact state.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-content-panel canvas-stack-sm">
          <div className="canvas-wrap-sm items-center">
            <CalendarClockIcon data-icon="inline-start" />
            <span className="canvas-text-body">Window</span>
          </div>
          <Select
            onValueChange={(value) => setWindow(value as DashboardWindow)}
            value={window}
          >
            <SelectTrigger aria-label="Dashboard time window">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">{dashboardWindowLabels["6"]}</SelectItem>
              <SelectItem value="12">{dashboardWindowLabels["12"]}</SelectItem>
              <SelectItem value="24">{dashboardWindowLabels["24"]}</SelectItem>
              <SelectItem value="all">{dashboardWindowLabels.all}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="canvas-content-panel canvas-stack-sm">
          <div className="canvas-wrap-sm items-center">
            <BarChart3Icon data-icon="inline-start" />
            <span className="canvas-text-body">Metric</span>
          </div>
          <ToggleGroup
            onValueChange={(value) => {
              if (value === "traffic" || value === "tokens" || value === "cost") {
                setMetric(value)
              }
            }}
            type="single"
            value={metric}
            variant="outline"
          >
            <ToggleGroupItem value="traffic">
              {dashboardMetricLabels.traffic}
            </ToggleGroupItem>
            <ToggleGroupItem value="tokens">
              {dashboardMetricLabels.tokens}
            </ToggleGroupItem>
            <ToggleGroupItem value="cost">
              {dashboardMetricLabels.cost}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    </section>
  )
}
