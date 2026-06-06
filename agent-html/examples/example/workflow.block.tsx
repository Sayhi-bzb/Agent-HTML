import { ArrowRightIcon, RouteIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

import { workflowSteps } from "./data"

export function WorkflowBlock() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent reading route</CardTitle>
        <CardDescription>
          A split artifact should make the next file obvious from the current
          task.
        </CardDescription>
      </CardHeader>
      <CardContent className="canvas-stack-md">
        {workflowSteps.map((step, index) => (
          <div className="canvas-content-panel" key={step.id}>
            <div className="canvas-cluster-md">
              <div className="canvas-icon-box-sm">
                <RouteIcon />
              </div>
              <div className="canvas-stack-sm min-w-0">
                <div className="canvas-wrap-sm items-center">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="canvas-text-body">{step.label}</span>
                  {index < workflowSteps.length - 1 ? (
                    <ArrowRightIcon data-icon="inline-start" />
                  ) : null}
                </div>
                <p className="canvas-text-body text-muted-foreground">
                  {step.summary}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
