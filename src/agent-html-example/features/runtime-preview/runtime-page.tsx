import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  AgentHtmlBlockRuntimeProvider,
  AgentHtmlBlockWrapper,
  formatHtmlSource,
  getSourceMetrics,
  inferAgentHtmlInteractionUnits,
  parseAgentHtml,
  renderAgentHtml,
  validateAgentHtml,
} from "@/agent-html"
import { agentHtmlExampleCases } from "@/agent-html-example/cases"
import type { ExampleThemeId } from "@/agent-html-example/theme/theme-presets"
import { RuntimeShell } from "@/agent-html-example/features/runtime-preview/runtime-shell"
import { ValidationErrors } from "@/agent-html-example/features/runtime-preview/validation-errors"

const activeCase = agentHtmlExampleCases[0]

export function AgentHtmlRuntimePage({
  onThemeChange,
  theme,
}: {
  onThemeChange: (theme: ExampleThemeId) => void
  theme: ExampleThemeId
}) {
  const runtime = React.useMemo(() => {
    const document = parseAgentHtml(activeCase.ahtmlSource)
    const validation = validateAgentHtml(document)
    const interactionUnits = validation.ok
      ? inferAgentHtmlInteractionUnits(document)
      : null
    const sourceContent = validation.ok ? renderAgentHtml(document) : null
    const htmlSource = sourceContent
      ? formatHtmlSource(renderToStaticMarkup(sourceContent))
      : ""

    return {
      ahtmlMetrics: getSourceMetrics(activeCase.ahtmlSource),
      document,
      htmlMetrics: getSourceMetrics(htmlSource),
      htmlSource,
      interactionUnits,
      reactMetrics: getSourceMetrics(activeCase.reactSource),
      validation,
    }
  }, [])

  const renderedContent = React.useMemo(() => {
    return runtime.validation.ok
      ? renderAgentHtml(runtime.document, {
          highlightBlocks: true,
          interactionUnits: runtime.interactionUnits ?? undefined,
          renderBlockWrapper: ({ children, className, key, path }) => (
            <AgentHtmlBlockWrapper
              className={className}
              key={key}
              path={path}
            >
              {children}
            </AgentHtmlBlockWrapper>
          ),
        })
      : null
  }, [runtime])

  return (
    <AgentHtmlBlockRuntimeProvider>
      <RuntimeShell
        ahtmlMetrics={runtime.ahtmlMetrics}
        ahtmlSource={activeCase.ahtmlSource}
        htmlMetrics={runtime.htmlMetrics}
        htmlSource={runtime.htmlSource}
        reactMetrics={runtime.reactMetrics}
        reactSource={activeCase.reactSource}
        onThemeChange={onThemeChange}
        theme={theme}
      >
        {renderedContent ? (
          renderedContent
        ) : (
          <ValidationErrors errors={runtime.validation.errors} />
        )}
      </RuntimeShell>
    </AgentHtmlBlockRuntimeProvider>
  )
}
