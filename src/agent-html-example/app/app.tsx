import { AgentHtmlRuntimeTheme } from "@/agent-html"
import { AgentHtmlRuntimePage } from "@/agent-html-example/features/runtime-preview/runtime-page"

export function AgentHtmlExampleApp() {
  return (
    <AgentHtmlRuntimeTheme>
      <AgentHtmlRuntimePage />
    </AgentHtmlRuntimeTheme>
  )
}
