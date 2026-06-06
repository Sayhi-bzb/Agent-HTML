import artifactSource from "@example/cases/introduce-agent-html.ahtml?raw"
import artifactSourceZh from "@example/cases/introduce-agent-html-cn.ahtml?raw"
import reactSource from "@example/cases/introduce-agent-html.react.tsx?raw"

export const agentHtmlExampleCases = [
  {
    id: "introduce-agent-html",
    locale: "en",
    title: "Introducing agent-html",
    artifactSource,
    reactSource,
  },
  {
    id: "introduce-agent-html-zh",
    locale: "zh",
    title: "介绍 agent-html",
    artifactSource: artifactSourceZh,
    reactSource,
  },
] as const

export type AgentHtmlExampleCase = (typeof agentHtmlExampleCases)[number]
export type AgentHtmlExampleLocale = AgentHtmlExampleCase["locale"]
