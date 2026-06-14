import { CodeBlock } from "../../components/code-block"
import { Badge } from "../../components/ui/badge"
import { CodeRiskTreemap } from "./code-risk-treemap"
import { codeMetricRows } from "./data/generated-code-metrics"
import { fileTypes, riskFiles, selectedDiff } from "./data/risk-map"

export default function DiffRiskMapBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          diff risk map
        </p>
        <h2 className="canvas-text-heading">
          Changed lines show size. Heat shows consequence.
        </h2>
      </div>

      <div className="grid gap-5 rounded-md bg-background p-4 lg:grid-cols-[minmax(0,0.58fr)_minmax(320px,0.42fr)]">
        <div className="canvas-stack-sm">
          <div className="flex flex-wrap gap-2">
            {fileTypes.map((type) => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
          <CodeRiskTreemap metrics={codeMetricRows} risks={riskFiles} />
        </div>
        <CodeBlock
          caption="Selected candidate: the file is not the largest surface, but sorting, filtering, pagination, search, and row behavior converge here."
          code={selectedDiff}
          language="diff"
          title="selected-candidate.diff"
        />
      </div>
    </section>
  )
}
