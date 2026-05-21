import { LoaderCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { SessionDetail, SourceValidationSnapshot } from "@/lib/types"

type SourceTabProps = {
  session: SessionDetail
  draftSource: string
  hasUnsavedChanges: boolean
  saving: boolean
  validating: boolean
  validation?: SourceValidationSnapshot
  onSaveSource: () => void
  onValidate: () => void
  onDraftSourceChange: (source: string) => void
}

export function SourceTab({
  session,
  draftSource,
  hasUnsavedChanges,
  saving,
  validating,
  validation,
  onSaveSource,
  onValidate,
  onDraftSourceChange,
}: SourceTabProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Source</CardTitle>
            <CardDescription>{session.sourcePath}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? <Badge variant="outline">dirty</Badge> : null}
            <Button onClick={onValidate} size="sm" type="button" variant="outline">
              Validate
            </Button>
            <Button
              disabled={!hasUnsavedChanges || saving}
              onClick={onSaveSource}
              size="sm"
              type="button"
            >
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-4">
        <Textarea
          className="min-h-0 flex-1 resize-none font-mono"
          onChange={(event) => onDraftSourceChange(event.target.value)}
          value={draftSource}
        />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {validating ? (
            <>
              <LoaderCircleIcon className="size-3.5 animate-spin" />
              Validating
            </>
          ) : validation ? (
            <>
              <Badge
                variant={validation.status === "valid" ? "default" : "destructive"}
              >
                {validation.status}
              </Badge>
              <span>{validation.structureSummary}</span>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
