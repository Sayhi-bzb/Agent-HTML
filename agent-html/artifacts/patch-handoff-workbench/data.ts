export const reviewLanes = ["queued", "reviewing", "owner", "ready"] as const

export type ReviewLane = (typeof reviewLanes)[number]

export type ReviewStatus = "Needs human" | "Agent pass" | "Blocked" | "Ready"

export type Severity = "Critical" | "High" | "Medium" | "Low"

export type PatchReviewItem = {
  area: string
  files: number
  id: string
  owner: string
  reviewer: string
  risk: Severity
  status: ReviewStatus
  summary: string
}

export type TriageIssue = {
  evidence: string
  id: string
  owner: string
  severity: Severity
  status: "Open" | "Investigating" | "Fixed" | "Deferred"
  title: string
}

export type HandoffCard = {
  assignee: string
  id: string
  signal: ReviewStatus
  summary: string
  title: string
}

export type HandoffBoardState = Record<ReviewLane, HandoffCard[]>

export type ReviewBrief = {
  body: string
  owner: string
  title: string
}

export type ReviewFinding = {
  evidence: string
  id: string
  severity: Severity
  title: string
}

export const laneLabels: Record<ReviewLane, string> = {
  owner: "Owner Follow-up",
  queued: "Intake",
  ready: "Ready To Ship",
  reviewing: "Diff Review",
}

export const humanConcern: ReviewBrief = {
  body:
    "The reviewer needs to know whether the patch preserves Artifact and Block protocol boundaries while still giving the next agent enough state to continue.",
  owner: "Human reviewer",
  title: "Do not lose the protocol while making the workflow richer",
}

export const patchIntent: ReviewBrief = {
  body:
    "Turn a static code review into a coordinated work surface: risk summary, selectable diff, triaged findings, movable handoff state, and a copyable packet.",
  owner: "Patch author",
  title: "Make the handoff executable",
}

export const reviewFindings: ReviewFinding[] = [
  {
    evidence: "The artifact entry keeps Artifact and Block protocol-only.",
    id: "FND-1",
    severity: "High",
    title: "Protocol boundary stays intact",
  },
  {
    evidence: "Diff, triage, board movement, and packet state are separated into semantic blocks.",
    id: "FND-2",
    severity: "Medium",
    title: "Review state is inspectable",
  },
  {
    evidence: "The packet lists scope, validation, and residual risk for the next agent turn.",
    id: "FND-3",
    severity: "High",
    title: "Context survives handoff",
  },
]

export const reviewItems: PatchReviewItem[] = [
  {
    area: "Artifact protocol",
    files: 4,
    id: "PHW-101",
    owner: "Agent",
    reviewer: "Human",
    risk: "Critical",
    status: "Needs human",
    summary: "Confirm Artifact and Block props stay protocol-only.",
  },
  {
    area: "Diff parser",
    files: 3,
    id: "PHW-102",
    owner: "Human",
    reviewer: "Agent",
    risk: "High",
    status: "Agent pass",
    summary: "Check hunk grouping and line references before handoff.",
  },
  {
    area: "Issue triage",
    files: 2,
    id: "PHW-103",
    owner: "Agent",
    reviewer: "Human",
    risk: "Medium",
    status: "Blocked",
    summary: "Map failing evidence to an actionable owner decision.",
  },
  {
    area: "Validation",
    files: 5,
    id: "PHW-104",
    owner: "Human",
    reviewer: "Agent",
    risk: "Low",
    status: "Ready",
    summary: "Package commands, expected output, and residual risk.",
  },
  {
    area: "Patch packet",
    files: 1,
    id: "PHW-105",
    owner: "Agent",
    reviewer: "Human",
    risk: "High",
    status: "Needs human",
    summary: "Prepare a compact summary that survives handoff context loss.",
  },
]

export const triageIssues: TriageIssue[] = [
  {
    evidence: "DataTable row click must not swallow checkbox interaction.",
    id: "ISS-42",
    owner: "Agent",
    severity: "High",
    status: "Investigating",
    title: "Selection event conflict",
  },
  {
    evidence: "Patch packet should identify exact validation commands.",
    id: "ISS-43",
    owner: "Human",
    severity: "Medium",
    status: "Open",
    title: "Missing validation handoff",
  },
  {
    evidence: "Review queue has one unresolved blocker before ship.",
    id: "ISS-44",
    owner: "Agent",
    severity: "Critical",
    status: "Open",
    title: "Critical path blocker",
  },
  {
    evidence: "Owner accepted the low-risk copy update.",
    id: "ISS-45",
    owner: "Human",
    severity: "Low",
    status: "Fixed",
    title: "Resolved wording drift",
  },
]

export const initialHandoffBoard: HandoffBoardState = {
  owner: [
    {
      assignee: "Human",
      id: "card-owner-proof",
      signal: "Needs human",
      summary: "Decide whether the Critical blocker is release-stopping.",
      title: "Resolve release gate",
    },
  ],
  queued: [
    {
      assignee: "Agent",
      id: "card-scan-diff",
      signal: "Agent pass",
      summary: "Summarize changed hunks and likely blast radius.",
      title: "Scan incoming patch",
    },
    {
      assignee: "Agent",
      id: "card-build-packet",
      signal: "Ready",
      summary: "Draft a patch packet with commands and residual risk.",
      title: "Build handoff packet",
    },
  ],
  ready: [
    {
      assignee: "Human",
      id: "card-final-read",
      signal: "Ready",
      summary: "Final read confirms scope, checks, and open questions.",
      title: "Final reviewer read",
    },
  ],
  reviewing: [
    {
      assignee: "Agent",
      id: "card-line-review",
      signal: "Blocked",
      summary: "Inspect the selected hunk for protocol violations.",
      title: "Line-level review",
    },
  ],
}

export const diffExample = `diff --git a/agent-html/artifacts/patch-handoff-workbench.artifact.tsx b/agent-html/artifacts/patch-handoff-workbench.artifact.tsx
new file mode 100644
@@
+import { Artifact, Block } from "@agent-html/react"
+
+export default function PatchHandoffWorkbenchArtifact() {
+  return (
+    <Artifact title="Patch Handoff Workbench">
+      <Block id="review-brief" title="Review Brief">
+        <ReviewBriefBlock />
+      </Block>
+    </Artifact>
+  )
+}`

export const reviewChecklist = [
  "Protocol props are unchanged on Artifact and Block.",
  "Every major work surface has a stable block id.",
  "Badges express status, severity, or count only.",
  "Patch packet includes validation and residual risk.",
]

export const patchPacket = `Patch: Patch Handoff Workbench
Scope:
- agent-html/artifacts/patch-handoff-workbench.artifact.tsx
- agent-html/artifacts/patch-handoff-workbench/**

Reviewer packet:
1. Start with PHW-101 for protocol compliance.
2. Check ISS-44 before marking the handoff board ready.
3. Confirm the packet lists local validation commands and unresolved risks.

Suggested validation:
- npm run typecheck
- npm run test:run
- git diff --check`

export const agentNoteTemplate = `Human context:
- What changed:
- What needs review:
- Evidence:
- Validation:
- Residual risk:

Agent next action:
- Continue from the highest severity open issue.
- Preserve Artifact and Block protocol props.
- Keep the patch packet updated before handoff.`
