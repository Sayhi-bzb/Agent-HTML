import { CodeBlock } from "../../components/code-block"
import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"
import { fileTypes, riskFiles, selectedDiff } from "./data/risk-map"

export function DiffRiskMapBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          diff risk map
        </p>
        <h2 className="canvas-text-subheading">
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
          <div className="flex min-h-72 flex-wrap items-end gap-3">
            {riskFiles.map((file) => (
              <div
                className={`${file.size} ${file.tone} flex flex-col justify-between rounded-sm p-2`}
                key={file.file}
              >
                <div className="canvas-stack-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-mono text-xs">{file.file}</p>
                    <StatusBadge status={file.status}>{file.risk}</StatusBadge>
                  </div>
                  <p className="canvas-text-caption text-muted-foreground">
                    {file.consequence}
                  </p>
                </div>
                <p className="font-mono text-xs tracking-normal text-muted-foreground">
                  {file.type} · {file.lines}
                </p>
              </div>
            ))}
          </div>
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
