import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"

import { sourceGroups } from "./data"
import { SourceLinks } from "./source-links"

const photosGroup = sourceGroups.find((group) => group.label === "Photos")
const rightColumnGroups = sourceGroups.filter((group) =>
  ["Maps and transit", "Official place context"].includes(group.label)
)

export function SourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">sources</Badge>
        <h2 className="canvas-text-heading">Tokyo media and data sources</h2>
        <p className="canvas-text-body text-muted-foreground">
          Source details are collected here so the Tokyo route console layers
          can read continuously while imagery, map, and data sources
          remain traceable.
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        {photosGroup ? (
          <div className="canvas-stack-sm">
            <Badge variant="outline">{photosGroup.label}</Badge>
            <SourceLinks links={photosGroup.links} />
          </div>
        ) : null}

        <div className="canvas-stack-lg">
          {rightColumnGroups.map((group) => (
            <div className="canvas-stack-sm" key={group.label}>
              <Badge variant="outline">{group.label}</Badge>
              <SourceLinks links={group.links} />
            </div>
          ))}
        </div>
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
