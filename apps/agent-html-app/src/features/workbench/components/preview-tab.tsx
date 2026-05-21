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
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>{session.summary.name}</CardTitle>
            <CardDescription>{session.previewPath ?? "preview"}</CardDescription>
          </div>
          <Badge variant={build.status === "succeeded" ? "default" : "outline"}>
            {build.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-4">
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
          {previewHtml ? (
            <iframe
              className="size-full bg-background"
              srcDoc={previewHtml}
              title={`${session.summary.name} preview`}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
              Empty
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
