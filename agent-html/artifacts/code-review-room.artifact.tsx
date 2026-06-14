import { defineArtifact } from "@agent-html/react"

export default defineArtifact({
  title: "Code Review Room",
  blocks: [
    { id: "pr-overview", title: "PR Overview" },
    "diff-risk-map",
    "code-metrics",
    "blast-radius",
    "risk-evidence",
    "review-gate",
    "release-routes",
  ],
})
