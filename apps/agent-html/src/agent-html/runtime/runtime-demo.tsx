import { renderToStaticMarkup } from "react-dom/server"

import { formatHtmlSource } from "@/agent-html/runtime/format-html-source"
import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
import { renderAgentHtml } from "@/agent-html/runtime/render/render-agent-html"
import { getSourceMetrics } from "@/agent-html/runtime/source-metrics"
import { AgentHtmlRuntimeTheme } from "@/agent-html/runtime/runtime-theme"
import { validateAgentHtml } from "@/agent-html/validate/validate-agent-html"
import { RuntimeShell } from "@/agent-html/runtime/runtime-shell"
import runtimeSource from "@/agent-html/fixtures/valid/complex-dashboard.xml?raw"
import reactSource from "@/agent-html/examples/complex-dashboard.react.tsx?raw"

export function AgentHtmlRuntimeDemo() {
  const document = parseAgentHtml(runtimeSource)
  const validation = validateAgentHtml(document)
  const htmlSource = validation.ok
    ? formatHtmlSource(renderToStaticMarkup(renderAgentHtml(document)))
    : ""
  const ahtmlMetrics = getSourceMetrics(runtimeSource)
  const htmlMetrics = getSourceMetrics(htmlSource)
  const reactMetrics = getSourceMetrics(reactSource)

  return (
    <AgentHtmlRuntimeTheme>
      <RuntimeShell
        ahtmlMetrics={ahtmlMetrics}
        ahtmlSource={runtimeSource}
        htmlMetrics={htmlMetrics}
        htmlSource={htmlSource}
        reactMetrics={reactMetrics}
        reactSource={reactSource}
        title="Agent-HTML Runtime"
      >
        {validation.ok ? (
          renderAgentHtml(document)
        ) : (
          <div className="flex flex-col gap-3">
            {validation.errors.map((error) => (
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




