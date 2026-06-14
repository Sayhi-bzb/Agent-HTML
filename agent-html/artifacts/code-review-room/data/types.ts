export type Metric = {
  label: string
  value: number
}

export type SummaryItem = {
  label: string
  value: string
}

export type IntakeItem = {
  label: string
  value: string
}

export type CodeMetricRow = {
  cognitive: number
  cyclomatic: number
  diff: number
  fanIn: number
  fanOut: number
  loc: number
  mi: number
  module: string
  name: string
  nesting: number
  vol: number
}

export type ModuleStat = {
  cells: number
  dependedBy: number
  dependsOn: number
  loc: number
  module: string
  title: string
}

export type BlastRadiusNode = {
  cx: number
  cy: number
  label: string
}

export type BlastRadiusLayer = {
  items: [string, string][]
  value: string
}

export type PackageSankeyData = {
  links: Array<{
    source: number
    target: number
    value: number
  }>
  nodes: Array<{
    category?: "landing" | "outcome" | "source"
    name: string
  }>
}

export type EvidenceMatrixItem = {
  evidence: string
  impact: string
  note: string
  status: "default" | "destructive" | "success" | "warning"
}

export type EvidenceRow = {
  evidence: "covered" | "missing" | "partial"
  impact: string
  missingCheck: string
  risk: string
}

export type ReviewLane = {
  count: string
  detail: string
  label: string
  status: "default" | "destructive" | "success" | "warning"
}

export type ReviewGateCard = {
  detail: string
  id: string
  label: string
  status: "default" | "destructive" | "success" | "warning"
}

export type ReviewGateColumn = {
  cards: ReviewGateCard[]
  id: string
  label: string
  status: "default" | "destructive" | "success" | "warning"
}

export type PackageTimelineStep = {
  detail: string
  label: string
  step: number
  time: string
}

export type ReleaseRoute = {
  badge: string
  condition: string
  metrics: Metric[]
  value: string
}
