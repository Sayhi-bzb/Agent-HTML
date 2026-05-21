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
    <Card className="app-shell-fill-card">
      <CardHeader>
        <div className="app-shell-split-row">
          <div>
            <CardTitle>Source</CardTitle>
            <CardDescription>{session.sourcePath}</CardDescription>
          </div>
          <div className="app-shell-stack-compact">
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
      <CardContent className="app-shell-content-stack">
        <Textarea
          className="app-shell-editor-field"
          onChange={(event) => onDraftSourceChange(event.target.value)}
          value={draftSource}
        />
        <div className="app-shell-status-row">
          {validating ? (
            <>
              <LoaderCircleIcon className="app-shell-spinner" />
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
