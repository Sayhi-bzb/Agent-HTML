import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  formatHtmlSource,
  getSourceMetrics,
  parseAgentHtml,
  renderAgentHtml,
  validateAgentHtml,
} from "@/agent-html"
import { agentHtmlExampleCases } from "@/agent-html-example/cases"
import { RuntimeShell } from "@/agent-html-example/features/runtime-preview/runtime-shell"
import { ValidationErrors } from "@/agent-html-example/features/runtime-preview/validation-errors"

const activeCase = agentHtmlExampleCases[0]

export function AgentHtmlRuntimePage() {
  const runtime = React.useMemo(() => {
    const document = parseAgentHtml(activeCase.ahtmlSource)
    const validation = validateAgentHtml(document)
    const renderedContent = validation.ok ? renderAgentHtml(document) : null
    const htmlSource = renderedContent
      ? formatHtmlSource(renderToStaticMarkup(renderedContent))
      : ""

    return {
      ahtmlMetrics: getSourceMetrics(activeCase.ahtmlSource),
      htmlMetrics: getSourceMetrics(htmlSource),
      htmlSource,
      reactMetrics: getSourceMetrics(activeCase.reactSource),
      renderedContent,
      validation,
    }
  }, [])

  return (
    <RuntimeShell
      ahtmlMetrics={runtime.ahtmlMetrics}
      ahtmlSource={activeCase.ahtmlSource}
      htmlMetrics={runtime.htmlMetrics}
      htmlSource={runtime.htmlSource}
      reactMetrics={runtime.reactMetrics}
      reactSource={activeCase.reactSource}
      title={activeCase.title}
    >
      {runtime.renderedContent ? (
        runtime.renderedContent
      ) : (
        <ValidationErrors errors={runtime.validation.errors} />
      )}
    </RuntimeShell>
  )
}
