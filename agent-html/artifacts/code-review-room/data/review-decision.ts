import type { EvidenceMatrixItem, EvidenceRow, ReleaseRoute, ReviewLane } from "./types"

export const evidenceCategories = ["dependency", "runtime"]

export const evidenceMatrix = [
  {
    evidence: "covered",
    impact: "high impact",
    note: "LOC and cyclomatic pressure identify map, kanban, and sankey surfaces.",
    status: "success",
  },
  {
    evidence: "partial",
    impact: "high impact",
    note: "GitNexus process traces show flows, but index is behind HEAD.",
    status: "warning",
  },
  {
    evidence: "missing",
    impact: "high impact",
    note: "No committed per-symbol MI pipeline exists yet.",
    status: "destructive",
  },
  {
    evidence: "covered",
    impact: "medium impact",
    note: "Fan-out is estimated from imports for TypeScript and TSX files.",
    status: "success",
  },
  {
    evidence: "partial",
    impact: "medium impact",
    note: "Fan-in needs GitNexus graph enrichment before ranking shared primitives.",
    status: "warning",
  },
  {
    evidence: "missing",
    impact: "medium impact",
    note: "No runtime benchmark confirms table interaction cost.",
    status: "destructive",
  },
] satisfies EvidenceMatrixItem[]

export const evidenceRows = [
  {
    evidence: "covered",
    impact: "high",
    missingCheck: "none",
    risk: "map.tsx has highest LOC and cyclomatic score",
  },
  {
    evidence: "partial",
    impact: "high",
    missingCheck: "fan-in graph refresh",
    risk: "data-table.tsx is shared but fan-in is not in the local metric pass",
  },
  {
    evidence: "missing",
    impact: "medium",
    missingCheck: "per-symbol metric generator",
    risk: "large component files need function-level MI before refactor planning",
  },
] satisfies EvidenceRow[]

export const reviewLanes = [
  {
    count: "2",
    detail: "Generate per-symbol metrics before splitting shared primitives.",
    label: "blocking",
    status: "destructive",
  },
  {
    count: "3",
    detail: "Confirm whether map and sankey are intended as rich components or demos.",
    label: "question",
    status: "warning",
  },
  {
    count: "2",
    detail: "Move generated statistical data away from authored block logic.",
    label: "follow-up",
    status: "default",
  },
  {
    count: "1",
    detail: "Normalize metric labels before exposing them in the artifact copy.",
    label: "nit",
    status: "default",
  },
] satisfies ReviewLane[]

export const reviewChecks = [
  "Code metrics data is artifact-local",
  "Block files import data instead of defining large arrays",
  "Low-MI candidates link back to real Agent-HTML paths",
  "GitNexus staleness is visible in the evidence note",
]

export const releaseRoutes = [
  {
    badge: "fastest",
    condition: "Keep the data snapshot static and review only the top files.",
    metrics: [
      { label: "time cost", value: 32 },
      { label: "risk reduction", value: 54 },
      { label: "confidence", value: 58 },
    ],
    value: "snapshot review",
  },
  {
    badge: "draft pick",
    condition: "Add a small generator, then let the artifact consume generated TS data.",
    metrics: [
      { label: "time cost", value: 62 },
      { label: "risk reduction", value: 82 },
      { label: "confidence", value: 76 },
    ],
    value: "generated dataset",
  },
  {
    badge: "strictest",
    condition: "Refresh GitNexus and build a per-symbol metric pipeline first.",
    metrics: [
      { label: "time cost", value: 88 },
      { label: "risk reduction", value: 94 },
      { label: "confidence", value: 68 },
    ],
    value: "index-first refactor",
  },
] satisfies ReleaseRoute[]
