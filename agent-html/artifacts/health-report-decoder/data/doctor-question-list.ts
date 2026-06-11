import { sampleReport } from "./report"
import type { DoctorQueueItem } from "./types"

export const doctorQueue: DoctorQueueItem[] = sampleReport.labItems
  .filter((item) => item.status !== "normal")
  .map((item) => ({
    code: item.code,
    label: item.label,
    prompt: item.doctorQuestion,
    status: item.status,
  }))

