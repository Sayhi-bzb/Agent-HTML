import type {
  BlastRadiusLayer,
  BlastRadiusNode,
  PackageSankeyData,
} from "./types"

export const blastRadiusNodes = [
  { cx: 50, cy: 50, label: "agent-html" },
  { cx: 30, cy: 34, label: "artifacts" },
  { cx: 71, cy: 32, label: "components/ui" },
  { cx: 24, cy: 72, label: "styles/theme" },
  { cx: 76, cy: 70, label: "cli guards" },
] satisfies BlastRadiusNode[]

export const blastRadiusLayers = [
  {
    items: [
      ["Artifact protocol", "Artifact and Block come from @agent-html/react"],
      ["Workspace source", "agent-html/artifacts owns durable Canvas examples"],
      ["Rich components", "map, kanban, code-block, and sankey support artifact work"],
    ],
    value: "source",
  },
  {
    items: [
      ["components/ui", "local shadcn primitives own common controls"],
      ["styles/public", "semantic Canvas classes own content treatment"],
      ["theme presets", "host layout and token presets stay package-owned"],
    ],
    value: "surface",
  },
  {
    items: [
      ["canvas:typecheck", "validates the React Canvas TS surface"],
      ["canvas:guard", "checks host boundary and artifact import rules"],
      ["canvas:index:check", "keeps generated decision routes current"],
    ],
    value: "gates",
  },
] satisfies BlastRadiusLayer[]

export const packageSankeyData = {
  nodes: [
    { category: "source", name: "agent-html workspace" },
    { category: "landing", name: "artifacts" },
    { category: "landing", name: "components/ui" },
    { category: "landing", name: "rich components" },
    { category: "landing", name: "styles + theme" },
    { category: "outcome", name: "canvas:typecheck" },
    { category: "outcome", name: "canvas:guard" },
    { category: "outcome", name: "canvas:index:check" },
    { category: "outcome", name: "artifact evidence" },
    { category: "outcome", name: "package route" },
  ],
  links: [
    { source: 0, target: 1, value: 8 },
    { source: 0, target: 2, value: 7 },
    { source: 0, target: 3, value: 6 },
    { source: 0, target: 4, value: 4 },
    { source: 1, target: 5, value: 4 },
    { source: 1, target: 6, value: 3 },
    { source: 1, target: 7, value: 2 },
    { source: 2, target: 5, value: 3 },
    { source: 2, target: 8, value: 3 },
    { source: 3, target: 8, value: 4 },
    { source: 3, target: 9, value: 3 },
    { source: 4, target: 6, value: 2 },
    { source: 4, target: 9, value: 2 },
  ],
} satisfies PackageSankeyData
