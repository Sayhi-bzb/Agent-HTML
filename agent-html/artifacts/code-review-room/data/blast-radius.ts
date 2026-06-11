import type { BlastRadiusLayer, BlastRadiusNode } from "./types"

export const blastRadiusNodes = [
  { cx: 50, cy: 50, label: "data table" },
  { cx: 30, cy: 34, label: "artifacts" },
  { cx: 71, cy: 32, label: "ui primitives" },
  { cx: 24, cy: 72, label: "review blocks" },
  { cx: 76, cy: 70, label: "host forms" },
] satisfies BlastRadiusNode[]

export const blastRadiusLayers = [
  {
    items: [
      ["RiskEvidenceBlock", "renders sortable refactor candidates"],
      ["Health report blocks", "reuse dense inspection tables"],
      ["Tokyo route planner", "depends on interactive Canvas primitives"],
    ],
    value: "callers",
  },
  {
    items: [
      ["@tanstack/react-table", "owns sort/filter/pagination state"],
      ["components/ui/table", "owns selectable table structure"],
      ["components/ui/input", "owns search affordance"],
    ],
    value: "downstream",
  },
  {
    items: [
      ["Review accuracy", "wrong sorting hides low-MI candidates"],
      ["Canvas ergonomics", "dense rows need predictable scanning"],
      ["Primitive coupling", "table changes reach many artifact blocks"],
    ],
    value: "impact",
  },
] satisfies BlastRadiusLayer[]
