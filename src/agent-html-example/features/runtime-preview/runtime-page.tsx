import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  type AgentHtmlDocument,
  AgentHtmlBlockRuntimeProvider,
  AgentHtmlBlockWrapper,
  type AgentHtmlValidationError,
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
import {
  agentHtmlExampleCases,
  type AgentHtmlExampleCase,
  type AgentHtmlExampleLocale,
} from "@/agent-html-example/cases"
import type { ExampleThemeId } from "@/agent-html-example/theme/theme-presets"
import { createAgentHtmlBlockSummaryMap } from "@/agent-html-example/features/runtime-preview/block-summary"
import { RuntimeShell } from "@/agent-html-example/features/runtime-preview/runtime-shell"
import { ValidationErrors } from "@/agent-html-example/features/runtime-preview/validation-errors"

type AgentHtmlValidationResult = {
  errors: AgentHtmlValidationError[]
  ok: boolean
}

type RuntimeDocumentState = {
  document: AgentHtmlDocument
  source: string
  validation: AgentHtmlValidationResult
  version: number
}

function createRuntimeDocumentState(source: string): RuntimeDocumentState {
  const document = parseAgentHtml(source)

  return {
    document,
    source,
    validation: validateAgentHtml(document),
    version: 0,
  }
}

export function AgentHtmlRuntimePage({
  activeCase = agentHtmlExampleCases[0],
  locale,
  onLocaleChange,
  onThemeChange,
  theme,
}: {
  activeCase?: AgentHtmlExampleCase
  locale: AgentHtmlExampleLocale
  onLocaleChange: (locale: AgentHtmlExampleLocale) => void
  onThemeChange: (theme: ExampleThemeId) => void
  theme: ExampleThemeId
}) {
  const [runtimeState, setRuntimeState] = React.useState(() =>
    createRuntimeDocumentState(activeCase.ahtmlSource)
  )
  const [debugRuntime, setDebugRuntime] = React.useState<{
    blockSummaries: Record<string, string>
    htmlSource: string
    version: number
  }>(() => {
    return {
      blockSummaries: createAgentHtmlBlockSummaryMap(runtimeState.document),
      htmlSource: "",
      version: runtimeState.version,
    }
  })
  const deferredHtmlDocument = React.useDeferredValue(
    runtimeState.validation.ok ? runtimeState.document : null
  )

  const runtime = React.useMemo(() => {
    const interactionUnits = runtimeState.validation.ok
      ? inferAgentHtmlInteractionUnits(runtimeState.document)
      : null

    return {
      ahtmlMetrics: getSourceMetrics(runtimeState.source),
      blockSummaries:
        debugRuntime.version === runtimeState.version
          ? debugRuntime.blockSummaries
          : {},
      document: runtimeState.document,
      htmlSource:
        debugRuntime.version === runtimeState.version
          ? debugRuntime.htmlSource
          : "",
      interactionUnits,
      reactMetrics: getSourceMetrics(activeCase.reactSource),
      validation: runtimeState.validation,
    }
  }, [debugRuntime, runtimeState])

  const htmlMetrics = React.useMemo(() => {
    return runtime.htmlSource ? getSourceMetrics(runtime.htmlSource) : undefined
  }, [runtime.htmlSource])

  React.useEffect(() => {
    const nextRuntimeState = createRuntimeDocumentState(activeCase.ahtmlSource)

    setRuntimeState(nextRuntimeState)
    setDebugRuntime({
      blockSummaries: createAgentHtmlBlockSummaryMap(nextRuntimeState.document),
      htmlSource: "",
      version: nextRuntimeState.version,
    })
  }, [activeCase.ahtmlSource])

  React.useEffect(() => {
    if (!deferredHtmlDocument) {
      setDebugRuntime({
        blockSummaries: {},
        htmlSource: "",
        version: runtimeState.version,
      })
      return
    }

    const version = runtimeState.version
    React.startTransition(() => {
      const sourceContent = renderAgentHtml(deferredHtmlDocument)
      setDebugRuntime({
        blockSummaries: createAgentHtmlBlockSummaryMap(deferredHtmlDocument),
        htmlSource: formatHtmlSource(renderToStaticMarkup(sourceContent)),
        version,
      })
    })
  }, [deferredHtmlDocument, runtimeState.version])

  const handleDropIntent = React.useCallback(
    ({
      intent,
      sourcePath,
    }: {
      intent: AgentHtmlDropIntent
      sourcePath: string
    }) => {
      setRuntimeState((current) => {
        try {
          const nextDocument = applyAgentHtmlDropIntent(current.document, {
            intent,
            sourcePath,
          })
          const source = serializeAgentHtml(nextDocument)

          return {
            document: nextDocument,
            source,
            validation: validateAgentHtml(nextDocument),
            version: current.version + 1,
          }
        } catch {
          return current
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
          renderBlockWrapper: ({ children, className, path, unit }) => (
            <AgentHtmlBlockWrapper
              className={className}
              key={unit.motionKey}
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
        ahtmlSource={runtimeState.source}
        blockSummaries={runtime.blockSummaries}
        htmlMetrics={htmlMetrics}
        htmlSource={runtime.htmlSource}
        locale={locale}
        onLocaleChange={onLocaleChange}
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
