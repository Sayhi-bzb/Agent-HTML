import { ArrowRightIcon, RouteIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"

import { workflowSteps } from "./data"

export function WorkflowBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">Agent reading route</h2>
        <p className="canvas-text-body text-muted-foreground">
          A split artifact should make the next file obvious from the current
          task.
        </p>
      </div>

      <div className="canvas-grid-gap-md md:grid-cols-2">
        {workflowSteps.map((step, index) => (
          <div
            className="canvas-cluster-md canvas-content-panel-sm min-w-0 items-start"
            key={step.id}
          >
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
        ))}
      </div>
    </section>
  )
}
