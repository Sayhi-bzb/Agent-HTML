import type {
  PackageTimelineStep,
  ReleaseRoute,
  ReviewGateColumn,
  ReviewLane,
} from "./types"

export const reviewLanes = [
  {
    count: "2",
    detail: "Keep metrics artifact-local until a package generator exists.",
    label: "blocking",
    status: "destructive",
  },
  {
    count: "2",
    detail: "Confirm map and sankey remain rich components, not artifact-only demos.",
    label: "question",
    status: "warning",
  },
  {
    count: "2",
    detail: "Keep generated data outside authored block implementation files.",
    label: "follow-up",
    status: "default",
  },
  {
    count: "1",
    detail: "Use stable Canvas package names in visible metric labels.",
    label: "nit",
    status: "default",
  },
] satisfies ReviewLane[]

export const reviewGateColumns = [
  {
    cards: [
      {
        detail: "Artifact and Block stay protocol-only; no layout props on host wrappers.",
        id: "artifact-protocol",
        label: "@agent-html/react protocol",
        status: "destructive",
      },
      {
        detail: "No artifact imports app-server, host internals, or privileged APIs.",
        id: "host-boundary",
        label: "host boundary",
        status: "destructive",
      },
    ],
    id: "blocking",
    label: "blocking",
    status: "destructive",
  },
  {
    cards: [
      {
        detail: "Should map and sankey stay shared rich components after metric pressure?",
        id: "rich-component-scope",
        label: "rich component scope",
        status: "warning",
      },
      {
        detail: "Does the metrics snapshot need a committed generator before reuse?",
        id: "metrics-generator",
        label: "metrics generator",
        status: "warning",
      },
    ],
    id: "question",
    label: "question",
    status: "warning",
  },
  {
    cards: [
      {
        detail: "Keep generated data under data/generated-* and out of block source.",
        id: "generated-data",
        label: "generated data",
        status: "default",
      },
      {
        detail: "Run canvas:index:check after changing artifact block order or imports.",
        id: "index-check",
        label: "index check",
        status: "default",
      },
    ],
    id: "follow-up",
    label: "follow-up",
    status: "default",
  },
  {
    cards: [
      {
        detail: "Use stable package names: components/ui, rich components, artifacts.",
        id: "label-vocabulary",
        label: "label vocabulary",
        status: "default",
      },
    ],
    id: "nit",
    label: "nit",
    status: "default",
  },
] satisfies ReviewGateColumn[]

export const reviewChecks = [
  "Artifact and Block usage stays inside @agent-html/react protocol",
  "Block files import artifact-local data instead of defining large arrays",
  "No artifact imports Canvas host internals or app-server APIs",
  "canvas:validate, canvas:typecheck, and canvas:index:check stay green",
]

export const releaseRoutes = [
  {
    badge: "fastest",
    condition: "Keep changes inside code-review-room/data and artifact copy only.",
    metrics: [
      { label: "time cost", value: 32 },
      { label: "risk reduction", value: 54 },
      { label: "confidence", value: 58 },
    ],
    value: "artifact-only pass",
  },
  {
    badge: "draft pick",
    condition: "Add a package metrics generator, then refresh generated TS data.",
    metrics: [
      { label: "time cost", value: 62 },
      { label: "risk reduction", value: 82 },
      { label: "confidence", value: 76 },
    ],
    value: "workspace index refresh",
  },
  {
    badge: "strictest",
    condition: "Open a package-level RFC before splitting shared primitives.",
    metrics: [
      { label: "time cost", value: 88 },
      { label: "risk reduction", value: 94 },
      { label: "confidence", value: 68 },
    ],
    value: "primitive refactor RFC",
  },
] satisfies ReleaseRoute[]

export const packageTimelineSteps = [
  {
    detail: "Keep the review inside code-review-room data and copy while the package surface remains untouched.",
    label: "artifact-only pass",
    step: 1,
    time: "local",
  },
  {
    detail: "Refresh generated metrics, dependency summaries, and Canvas indexes when the dataset becomes reusable.",
    label: "workspace index refresh",
    step: 2,
    time: "workspace",
  },
  {
    detail: "Open a package-level refactor path before splitting shared primitives such as map, kanban, or sankey.",
    label: "primitive refactor RFC",
    step: 3,
    time: "package",
  },
] satisfies PackageTimelineStep[]
