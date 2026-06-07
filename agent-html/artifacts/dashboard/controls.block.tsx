import {
  BarChart3Icon,
  CalendarClockIcon,
  FilterIcon,
  GaugeIcon,
} from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { Label } from "../../components/ui/label"
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
import { Slider } from "../../components/ui/slider"
import { Switch } from "../../components/ui/switch"

import {
  dashboardMetricLabels,
  dashboardWindowLabels,
  type DashboardMetric,
  type DashboardWindow,
} from "./data"

type ControlsBlockProps = {
  anomalyOnly: boolean
  filteredRowCount: number
  metric: DashboardMetric
  setAnomalyOnly: (value: boolean) => void
  setMetric: (metric: DashboardMetric) => void
  setThresholdPercent: (value: number) => void
  setWindow: (window: DashboardWindow) => void
  sourceRowCount: number
  thresholdPercent: number
  window: DashboardWindow
}

export function ControlsBlock({
  anomalyOnly,
  filteredRowCount,
  metric,
  setAnomalyOnly,
  setMetric,
  setThresholdPercent,
  setWindow,
  sourceRowCount,
  thresholdPercent,
  window,
}: ControlsBlockProps) {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="outline">{sourceRowCount} sampled hours</Badge>
          <Badge variant={anomalyOnly ? "destructive" : "secondary"}>
            {filteredRowCount} active rows
          </Badge>
        </div>
        <h2 className="canvas-text-heading">Operating filters</h2>
        <p className="canvas-text-body text-muted-foreground">
          Tune the board around the window, metric pressure, and exception queue
          that operations needs to explain next.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-content-panel canvas-stack-sm">
          <div className="canvas-wrap-sm items-center">
            <CalendarClockIcon data-icon="inline-start" />
            <span className="canvas-text-body">Time window</span>
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
            <span className="canvas-text-body">Metric lens</span>
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

        <div className="canvas-content-panel canvas-stack-sm">
          <div className="canvas-wrap-sm items-center justify-between">
            <div className="canvas-wrap-sm items-center">
              <GaugeIcon data-icon="inline-start" />
              <Label className="canvas-text-body" htmlFor="dashboard-threshold">
                Pressure threshold
              </Label>
            </div>
            <Badge variant="outline">{thresholdPercent}%</Badge>
          </div>
          <Slider
            id="dashboard-threshold"
            max={95}
            min={35}
            onValueChange={(value) => setThresholdPercent(value[0] ?? 70)}
            step={5}
            value={[thresholdPercent]}
          />
          <p className="canvas-text-caption text-muted-foreground">
            Rows at or above this normalized metric pressure enter the exception
            model.
          </p>
        </div>

        <div className="canvas-content-panel canvas-stack-sm">
          <div className="canvas-wrap-sm items-center justify-between">
            <div className="canvas-wrap-sm items-center">
              <FilterIcon data-icon="inline-start" />
              <Label className="canvas-text-body" htmlFor="dashboard-anomalies">
                Exception queue
              </Label>
            </div>
            <Switch
              checked={anomalyOnly}
              id="dashboard-anomalies"
              onCheckedChange={setAnomalyOnly}
            />
          </div>
          <p className="canvas-text-caption text-muted-foreground">
            {anomalyOnly
              ? "Only records with pressure, spend, token, or latency exceptions remain."
              : "All records remain visible while exceptions are still scored."}
          </p>
        </div>
      </div>
    </section>
  )
}
