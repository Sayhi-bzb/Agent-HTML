import type { IntakeItem, SummaryItem } from "./types"

export const reviewSubject = {
  badge: "Agent-HTML / Canvas package review",
  evidenceCompleteness: 72,
  evidenceNote:
    "Readiness combines GitNexus structure, local TypeScript/TSX metrics, Canvas package scripts, and artifact protocol rules from agent-html.",
  subtitle:
    "A review surface for the React Canvas workspace package: artifact source, local primitives, rich workflow components, theme tokens, and CLI guard rails.",
  title: "Code Review Room",
}

export const summaryItems = [
  { label: "package", value: "agent-html" },
  { label: "symbols indexed", value: "2,778" },
  { label: "canvas scripts", value: "4" },
  { label: "risk candidates", value: "7" },
] satisfies SummaryItem[]

export const intakeItems = [
  {
    label: "package surface",
    value: "agent-html workspace + @agent-html/react artifact protocol",
  },
  {
    label: "required gates",
    value: "canvas:typecheck, canvas:guard, canvas:index:check, canvas:deps",
  },
  {
    label: "review focus",
    value: "artifacts, components/ui primitives, rich components, styles, and theme presets.",
  },
  {
    label: "decision target",
    value: "Decide whether a change stays artifact-local or crosses a package boundary.",
  },
] satisfies IntakeItem[]
