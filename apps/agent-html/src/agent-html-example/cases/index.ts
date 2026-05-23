import ahtmlSource from "@/agent-html-example/cases/complex-dashboard.ahtml?raw"
import reactSource from "@/agent-html-example/cases/complex-dashboard.react.tsx?raw"

export const agentHtmlExampleCases = [
  {
    id: "complex-dashboard",
    title: "Introducing agent-html",
    ahtmlSource,
    reactSource,
  },
] as const

export const agentHtmlWorkspaceTemplates = agentHtmlExampleCases.map(
  ({ ahtmlSource, id, title }) => ({
    ahtmlSource,
    id,
    title,
  })
)
