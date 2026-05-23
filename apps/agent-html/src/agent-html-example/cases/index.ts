import ahtmlSource from "@/agent-html-example/cases/complex-dashboard.ahtml?raw"
import reactSource from "@/agent-html-example/cases/complex-dashboard.react.tsx?raw"

export const agentHtmlExampleCases = [
  {
    id: "complex-dashboard",
    title: "Agent-HTML Runtime",
    ahtmlSource,
    reactSource,
  },
] as const
