import { FileSearchIcon } from "lucide-react"

import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {
  humanConcern,
  patchIntent,
  reviewFindings,
  reviewItems,
} from "./data"
import {
  CountBadge,
  SeverityBadge,
  StatusBadge,
  WorkbenchHeader,
} from "./shared"

export function ReviewBriefBlock() {
  const blockerCount = reviewItems.filter(
    (item) => item.status === "Blocked"
  ).length
  const humanCount = reviewItems.filter(
    (item) => item.status === "Needs human"
  ).length
  const highRiskCount = reviewItems.filter(
    (item) => item.risk === "Critical" || item.risk === "High"
  ).length
  const leadItem = reviewItems[0]

  return (
    <section className="canvas-stack-lg">
      <WorkbenchHeader title="Review brief">
        Start the handoff with the human concern, agent findings, patch intent,
        and the exact queue pressure before opening the diff.
      </WorkbenchHeader>

      <div className="canvas-wrap-sm">
        <CountBadge count={reviewItems.length} label="patches" />
        <CountBadge count={humanCount} label="human gates" />
        <CountBadge count={highRiskCount} label="high risk" />
        <CountBadge count={blockerCount} label="blockers" />
      </div>

      <Tabs defaultValue="concern">
        <TabsList>
          <TabsTrigger value="concern">Human concern</TabsTrigger>
          <TabsTrigger value="findings">Agent findings</TabsTrigger>
          <TabsTrigger value="intent">Patch intent</TabsTrigger>
        </TabsList>

        <TabsContent value="concern">
          <BriefPanel
            body={humanConcern.body}
            eyebrow={humanConcern.owner}
            title={humanConcern.title}
          />
        </TabsContent>

        <TabsContent value="findings">
          <div className="canvas-grid-gap md:grid-cols-3">
            {reviewFindings.map((finding) => (
              <div className="canvas-content-panel-sm canvas-stack-sm" key={finding.id}>
                <div className="canvas-wrap-sm items-center justify-between">
                  <span className="canvas-text-caption text-muted-foreground">
                    {finding.id}
                  </span>
                  <SeverityBadge severity={finding.severity} />
                </div>
                <h3 className="canvas-text-body">{finding.title}</h3>
                <p className="canvas-text-body text-muted-foreground">
                  {finding.evidence}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="intent">
          <BriefPanel
            body={patchIntent.body}
            eyebrow={patchIntent.owner}
            title={patchIntent.title}
          />
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="canvas-content-panel canvas-grid-gap md:grid-cols-2">
        <div className="canvas-stack-sm">
          <div className="canvas-wrap-sm">
            <SeverityBadge severity={leadItem.risk} />
            <StatusBadge status={leadItem.status} />
            <CountBadge count={leadItem.files} label="files" />
          </div>
          <h3 className="canvas-text-heading">{leadItem.area}</h3>
          <p className="canvas-text-body text-muted-foreground">
            {leadItem.summary}
          </p>
        </div>
        <Button type="button" variant="outline">
          <FileSearchIcon data-icon="inline-start" />
          Open diff review
        </Button>
      </div>
    </section>
  )
}

function BriefPanel({
  body,
  eyebrow,
  title,
}: {
  body: string
  eyebrow: string
  title: string
}) {
  return (
    <div className="canvas-content-panel canvas-stack-sm">
      <p className="canvas-text-caption text-muted-foreground">{eyebrow}</p>
      <h3 className="canvas-text-heading">{title}</h3>
      <p className="canvas-text-body text-muted-foreground">{body}</p>
    </div>
  )
}
