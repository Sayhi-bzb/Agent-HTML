import { sampleReport } from "./report"
import { statusFor } from "./status"
import type { LabItem, ReportStatus } from "./types"

const statusScore = {
  consult: 95,
  normal: 24,
  recheck: 72,
  watch: 52,
} satisfies Record<ReportStatus, number>

const systemLabels = {
  blood: "血液",
  cardio: "心血管",
  glucose: "血糖",
  kidney: "肾功能",
  liver: "肝功能",
  urine: "尿检",
} as const

function groupBySystem(items: readonly LabItem[]) {
  const groups = new Map<string, LabItem[]>()

  items.forEach((item) => {
    groups.set(item.systemId, [...(groups.get(item.systemId) ?? []), item])
  })

  return groups
}

export const reportRadarItems = Array.from(
  groupBySystem(sampleReport.labItems).entries()
).map(([systemId, items]) => {
  const score = Math.max(...items.map((item) => statusScore[item.status]))
  const leadItem =
    items.find((item) => statusScore[item.status] === score) ?? items[0]
  const meta = leadItem ? statusFor(leadItem.status) : null

  return {
    code: leadItem?.code ?? systemId,
    label: systemLabels[systemId as keyof typeof systemLabels] ?? systemId,
    note: leadItem?.doctorQuestion ?? "作为报告背景保留。",
    status: leadItem?.status ?? "normal",
    statusLabel: meta?.label ?? "正常",
    value: score,
  }
})
