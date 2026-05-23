import { renderToStaticMarkup } from "react-dom/server"

import { parseAgentHtml } from "@/gallery/preview/agent-html/parse/parse-agent-html"
import { renderAgentHtml } from "@/gallery/preview/agent-html/render/render-agent-html"
import { getSourceMetrics } from "@/gallery/preview/agent-html/source-metrics"
import { AgentHtmlPreviewTheme } from "@/gallery/preview/agent-html/theme-runtime"
import { validateAgentHtml } from "@/gallery/preview/agent-html/validate/validate-agent-html"
import { RuntimePreviewShell } from "@/gallery/preview/agent-html/runtime-preview-shell"
import runtimeSource from "@/gallery/preview/agent-html/fixtures/valid/complex-dashboard.xml?raw"
import reactSource from "@/gallery/preview/agent-html/examples/complex-dashboard.react.tsx?raw"

export function AgentHtmlRuntimePreview() {
  const document = parseAgentHtml(runtimeSource)
  const validation = validateAgentHtml(document)
  const htmlSource = validation.ok ? renderToStaticMarkup(renderAgentHtml(document)) : ""
  const ahtmlMetrics = getSourceMetrics(runtimeSource)
  const htmlMetrics = getSourceMetrics(htmlSource)
  const reactMetrics = getSourceMetrics(reactSource)

  return (
    <AgentHtmlPreviewTheme>
      <RuntimePreviewShell
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
      </RuntimePreviewShell>
    </AgentHtmlPreviewTheme>
  )
}
