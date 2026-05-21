import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { BuildRunSummary, SessionDetail } from "@/lib/types"

type PreviewTabProps = {
  session: SessionDetail
  build: BuildRunSummary
  previewHtml?: string
}

export function PreviewTab({
  session,
  build,
  previewHtml,
}: PreviewTabProps) {
  return (
    <Card className="app-shell-fill-card">
      <CardHeader>
        <div className="app-shell-split-row">
          <div>
            <CardTitle>{session.summary.name}</CardTitle>
            <CardDescription>{session.previewPath ?? "preview"}</CardDescription>
          </div>
          <Badge variant={build.status === "succeeded" ? "default" : "outline"}>
            {build.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="app-shell-content-stack">
        <div className="app-shell-preview-frame">
          {previewHtml ? (
            <iframe
              className="size-full bg-background"
              srcDoc={previewHtml}
              title={`${session.summary.name} preview`}
            />
          ) : (
            <div className="app-shell-empty-canvas">
              Empty
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
