import type { ComponentExposurePolicy } from "./types"

export const COMPONENT_EXPOSURE_POLICIES = [
  {
    component: "alert",
    rawCandidates: ["variant"],
    openedRawCandidates: ["variant"],
  },
  {
    component: "badge",
    rawCandidates: ["variant"],
    openedRawCandidates: ["variant"],
  },
  {
    component: "select",
    rawCandidates: ["size"],
    lockedRawCandidates: ["size"],
  },
  {
    component: "switch",
    rawCandidates: ["size"],
    lockedRawCandidates: ["size"],
  },
] as const satisfies readonly ComponentExposurePolicy[]
