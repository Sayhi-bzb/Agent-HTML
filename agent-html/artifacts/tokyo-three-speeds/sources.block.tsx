import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"

import { sourceGroups } from "./data"
import { SourceLinks } from "./source-links"

export function SourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">sources</Badge>
        <h2 className="canvas-text-heading">Tokyo media and data sources</h2>
        <p className="canvas-text-body text-muted-foreground">
          Source details are collected here so the Tokyo route console layers
          can read continuously while imagery, map, video, and data sources
          remain traceable.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        {sourceGroups.map((group) => (
          <div className="canvas-stack-sm" key={group.label}>
            <Badge variant="outline">{group.label}</Badge>
            <SourceLinks links={group.links} />
          </div>
        ))}
      </div>

      <Alert>
        <AlertDescription>
          GO TOKYO stock photos may require application and prescribed credit.
          Wikimedia files require file-level license checks. Unsplash credit is
          recommended. OpenStreetMap requires © OpenStreetMap contributors and
          compliant tile usage. ODPT and Tokyo tourism data require their stated
          terms and attribution.
        </AlertDescription>
      </Alert>
    </section>
  )
}
