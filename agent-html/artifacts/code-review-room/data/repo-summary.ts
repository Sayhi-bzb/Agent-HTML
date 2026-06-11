import type { IntakeItem, SummaryItem } from "./types"

export const reviewSubject = {
  badge: "Agent-HTML / repo-derived review",
  evidenceCompleteness: 64,
  evidenceNote:
    "GitNexus supplies real structure and process data; local static analysis supplies code-health metrics for TypeScript and TSX files.",
  subtitle:
    "A review surface for finding refactor candidates in the Canvas runtime by reading risk, dependency shape, and evidence before opening files.",
  title: "Code Review Room",
}

export const summaryItems = [
  { label: "files scanned", value: "373" },
  { label: "symbols indexed", value: "2,778" },
  { label: "processes", value: "219" },
  { label: "risk candidates", value: "8" },
] satisfies SummaryItem[]

export const intakeItems = [
  {
    label: "repository",
    value: "Agent-HTML",
  },
  {
    label: "analysis source",
    value: "GitNexus index + local TypeScript/TSX metric pass",
  },
  {
    label: "review focus",
    value: "Canvas components and artifact blocks with high LOC, fan-out, or MI pressure.",
  },
  {
    label: "decision target",
    value: "Choose which code-health candidates should be split, tested, or left alone.",
  },
] satisfies IntakeItem[]
