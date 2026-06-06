import { FileCode2Icon, SparklesIcon } from "lucide-react"

import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"

import { exampleCopy } from "./copy"

export function BriefBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge className="w-fit" variant="secondary">
          split artifact pattern
        </Badge>
        <h2 className="canvas-text-title">{exampleCopy.title}</h2>
      </div>

      <div className="canvas-cluster-lg canvas-content-panel items-start">
        <div className="canvas-icon-box-md">
          <FileCode2Icon />
        </div>
        <p className="canvas-text-body text-muted-foreground">
          {exampleCopy.summary}
        </p>
      </div>

      <Alert>
        <SparklesIcon />
        <AlertDescription>{exampleCopy.alert}</AlertDescription>
      </Alert>
    </section>
  )
}
