import type { ReportStatus, StatusVariant } from "./types"

export const statusMeta = {
  normal: {
    label: "正常",
    lane: "先收好",
    status: "success",
  },
  watch: {
    label: "需观察",
    lane: "下次对照",
    status: "info",
  },
  recheck: {
    label: "建议复查",
    lane: "约个复查",
    status: "warning",
  },
  consult: {
    label: "咨询医生",
    lane: "当面问清",
    status: "destructive",
  },
} as const satisfies Record<
  ReportStatus,
  { label: string; lane: string; status: StatusVariant }
>

export function statusFor(status: ReportStatus) {
  return statusMeta[status]
}

