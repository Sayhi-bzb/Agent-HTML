import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"

import { sourceGroups } from "./data"
import { SourceLinks } from "./source-links"

export function SourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">sources</Badge>
        <h2 className="canvas-text-heading">
          Health information sources and boundaries
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          Source links are collected here so the report decoder can read
          continuously while lab result literacy, public health communication,
          and example test context remain traceable.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        {sourceGroups.map((group) => (
          <div className="canvas-stack-xs" key={group.label}>
            <Badge variant="outline">{group.label}</Badge>
            <SourceLinks links={group.links} />
          </div>
        ))}
      </div>

      <Alert>
        <AlertDescription>
          These sources support report literacy and public health communication.
          They do not replace clinician discussion, personal medical history, or
          the reference ranges from a specific lab report.
        </AlertDescription>
      </Alert>
    </section>
  )
}
