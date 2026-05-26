import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  AgentHtmlBlockRuntimeProvider,
  AgentHtmlBlockWrapper,
  applyAgentHtmlDropIntent,
  formatHtmlSource,
  getSourceMetrics,
  inferAgentHtmlInteractionUnits,
  parseAgentHtml,
  renderAgentHtml,
  serializeAgentHtml,
  validateAgentHtml,
  type AgentHtmlDropIntent,
} from "@/agent-html"
import { agentHtmlExampleCases } from "@/agent-html-example/cases"
import type { ExampleThemeId } from "@/agent-html-example/theme/theme-presets"
import { createAgentHtmlBlockSummaryMap } from "@/agent-html-example/features/runtime-preview/block-summary"
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
  const [ahtmlSource, setAhtmlSource] = React.useState(activeCase.ahtmlSource)

  const runtime = React.useMemo(() => {
    const document = parseAgentHtml(ahtmlSource)
    const validation = validateAgentHtml(document)
    const interactionUnits = validation.ok
      ? inferAgentHtmlInteractionUnits(document)
      : null
    const sourceContent = validation.ok ? renderAgentHtml(document) : null
    const htmlSource = sourceContent
      ? formatHtmlSource(renderToStaticMarkup(sourceContent))
      : ""

    return {
      ahtmlMetrics: getSourceMetrics(ahtmlSource),
      blockSummaries: validation.ok ? createAgentHtmlBlockSummaryMap(document) : {},
      document,
      htmlMetrics: getSourceMetrics(htmlSource),
      htmlSource,
      interactionUnits,
      reactMetrics: getSourceMetrics(activeCase.reactSource),
      validation,
    }
  }, [ahtmlSource])

  const handleDropIntent = React.useCallback(
    ({
      intent,
      sourcePath,
    }: {
      intent: AgentHtmlDropIntent
      sourcePath: string
    }) => {
      setAhtmlSource((currentSource) => {
        try {
          const currentDocument = parseAgentHtml(currentSource)
          const nextDocument = applyAgentHtmlDropIntent(currentDocument, {
            intent,
            sourcePath,
          })

          return serializeAgentHtml(nextDocument)
        } catch {
          return currentSource
        }
      })
    },
    []
  )

  const renderedContent = React.useMemo(() => {
    return runtime.validation.ok
      ? renderAgentHtml(runtime.document, {
          highlightBlocks: true,
          interactionUnits: runtime.interactionUnits ?? undefined,
          renderBlockWrapper: ({ children, className, key, path, unit }) => (
            <AgentHtmlBlockWrapper
              className={className}
              key={key}
              path={path}
              unit={unit}
            >
              {children}
            </AgentHtmlBlockWrapper>
          ),
        })
      : null
  }, [runtime])

  return (
    <AgentHtmlBlockRuntimeProvider onDropIntent={handleDropIntent}>
      <RuntimeShell
        ahtmlMetrics={runtime.ahtmlMetrics}
        ahtmlSource={ahtmlSource}
        blockSummaries={runtime.blockSummaries}
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
