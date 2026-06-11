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

export type RiskFile = {
  consequence: string
  file: string
  lines: string
  risk: string
  size: string
  status: "default" | "destructive" | "success" | "warning"
  tone: string
  type: string
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

export type ReleaseRoute = {
  badge: string
  condition: string
  metrics: Metric[]
  value: string
}
