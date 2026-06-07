import { useState } from "react"
import { useEmitArtifactStateChange } from "@agent-html/react"

import { Button } from "../../components/ui/button"
import { Checkbox } from "../../components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../../components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Separator } from "../../components/ui/separator"
import { Textarea } from "../../components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../components/ui/toggle-group"
import { triageIssues } from "./data"
import { SeverityBadge, StatusBadge, WorkbenchHeader } from "./shared"

const blockId = "issue-triage"

type TriageMode = "agent" | "human" | "pair"

export function IssueTriageBlock() {
  const emitChange = useEmitArtifactStateChange({ blockId })
  const [mode, setMode] = useState<TriageMode>("pair")
  const [selectedIssueId, setSelectedIssueId] = useState(triageIssues[0].id)
  const [includeEvidence, setIncludeEvidence] = useState(true)
  const [note, setNote] = useState(
    "ISS-44 is the release gate. Human reviewer decides whether to defer."
  )
  const selectedIssue =
    triageIssues.find((issue) => issue.id === selectedIssueId) ??
    triageIssues[0]

  function recordChange({
    after,
    before,
    controlId,
    kind,
    semantic,
  }: {
    after: unknown
    before: unknown
    controlId: string
    kind: string
    semantic: string
  }) {
    emitChange({
      after,
      before,
      component: "issue-triage",
      controlId,
      kind,
      semantic,
    })
  }

  function chooseMode(value: string) {
    if (!value || value === mode) {
      return
    }

    recordChange({
      after: value,
      before: mode,
      controlId: "triage-mode",
      kind: "select",
      semantic: "set-triage-review-mode",
    })
    setMode(value as TriageMode)
  }

  function chooseIssue(value: string) {
    const next = triageIssues.find((issue) => issue.id === value)

    if (!next || next.id === selectedIssue.id) {
      return
    }

    recordChange({
      after: next.id,
      before: selectedIssue.id,
      controlId: "selected-issue",
      kind: "select",
      semantic: "select-triage-issue",
    })
    setSelectedIssueId(next.id)
  }

  function toggleEvidence(value: boolean) {
    recordChange({
      after: value,
      before: includeEvidence,
      controlId: "include-evidence",
      kind: "toggle",
      semantic: "toggle-triage-evidence",
    })
    setIncludeEvidence(value)
  }

  function recordNoteCommit() {
    recordChange({
      after: note,
      before: "",
      controlId: "handoff-note",
      kind: "set",
      semantic: "commit-triage-handoff-note",
    })
  }

  return (
    <section className="canvas-stack-lg">
      <WorkbenchHeader title="Issue triage">
        Convert review findings into a clear next owner, status, and handoff
        note. Mode, issue selection, and evidence toggles emit artifact state.
      </WorkbenchHeader>

      <div className="canvas-content-panel">
        <FieldGroup className="canvas-grid-gap md:grid-cols-2">
          <Field>
            <FieldLabel>Review mode</FieldLabel>
            <ToggleGroup onValueChange={chooseMode} type="single" value={mode}>
              <ToggleGroupItem value="agent">Agent</ToggleGroupItem>
              <ToggleGroupItem value="human">Human</ToggleGroupItem>
              <ToggleGroupItem value="pair">Pair</ToggleGroupItem>
            </ToggleGroup>
          </Field>

          <Field>
            <FieldLabel>Active issue</FieldLabel>
            <Select onValueChange={chooseIssue} value={selectedIssue.id}>
              <SelectTrigger aria-label="Active triage issue">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {triageIssues.map((issue) => (
                    <SelectItem key={issue.id} value={issue.id}>
                      {issue.id} {issue.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <Separator />

        <div className="canvas-grid-gap md:grid-cols-3">
          <div className="canvas-stack-sm">
            <div className="canvas-wrap-sm">
              <SeverityBadge severity={selectedIssue.severity} />
              <StatusBadge status={selectedIssue.status} />
            </div>
            <h3 className="canvas-text-heading">{selectedIssue.title}</h3>
            <p className="canvas-text-body text-muted-foreground">
              Owner: {selectedIssue.owner}
            </p>
          </div>

          <div className="canvas-stack-md md:col-span-2">
            {includeEvidence ? (
              <p className="canvas-text-body text-muted-foreground">
                {selectedIssue.evidence}
              </p>
            ) : null}

            <FieldSet>
              <FieldLegend>Packet inputs</FieldLegend>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox
                    checked={includeEvidence}
                    id="include-triage-evidence"
                    onCheckedChange={(value) => toggleEvidence(value === true)}
                  />
                  <FieldLabel htmlFor="include-triage-evidence">
                    Include evidence in handoff
                  </FieldLabel>
                </Field>
                <Field>
                  <FieldLabel htmlFor="triage-note">Handoff note</FieldLabel>
                  <Textarea
                    id="triage-note"
                    onBlur={recordNoteCommit}
                    onChange={(event) => setNote(event.currentTarget.value)}
                    value={note}
                  />
                </Field>
              </FieldGroup>
            </FieldSet>

            <div className="canvas-wrap-sm">
              <Button onClick={recordNoteCommit} type="button">
                Commit note
              </Button>
              <Button onClick={() => setNote("")} type="button" variant="outline">
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
