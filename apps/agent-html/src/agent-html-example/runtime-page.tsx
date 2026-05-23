import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  AgentHtmlRuntimeTheme,
  formatHtmlSource,
  getSourceMetrics,
  parseAgentHtml,
  renderAgentHtml,
  validateAgentHtml,
} from "@/agent-html"
import { agentHtmlExampleCases } from "@/agent-html-example/cases"
import { RuntimeShell } from "@/agent-html-example/runtime-shell"

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
    <AgentHtmlRuntimeTheme>
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
          <div className="flex flex-col gap-3">
            {runtime.validation.errors.map((error) => (
              <article
                key={`${error.code}:${error.path}`}
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive"
              >
                <p className="text-[length:var(--type-sm)] leading-[var(--type-base-line-height)] font-medium">
                  {error.code}
                </p>
                <p className="mt-1 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)]">
                  {error.path} - {error.message}
                </p>
              </article>
            ))}
          </div>
        )}
      </RuntimeShell>
    </AgentHtmlRuntimeTheme>
  )
}




