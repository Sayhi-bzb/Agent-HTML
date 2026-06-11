export type StatusVariant = "success" | "info" | "warning" | "destructive"

export type ReportStatus = "normal" | "watch" | "recheck" | "consult"

export type LabItem = {
  code: string
  doctorQuestion: string
  flag?: "high" | "low" | "trace"
  label: string
  rawNote: string
  referenceRange: string
  result: string
  status: ReportStatus
  systemId: string
  unit: string
  whyItMatters: string
}

export type SystemGroup = {
  id: string
  label: string
  note: string
  signal: string
}

export type DoctorQueueItem = {
  code: string
  label: string
  prompt: string
  status: ReportStatus
}

export type TrendSeries = {
  code: string
  context: string
  points: Array<{
    value: number
    year: string
  }>
}

export type LifeContextField = {
  label: string
  prompt: string
  record: string
}

export type SourceLink = {
  label: string
  note: string
  url: string
}

export type QuizQuestion = {
  correctOptionId: string
  explanation: string
  id: string
  options: Array<{
    id: string
    label: string
  }>
  prompt: string
  relatedCode?: string
}
