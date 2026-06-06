import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  type AgentHtmlDocument,
  AgentHtmlBlockRuntimeProvider,
  type AgentHtmlValidationError,
  applyAgentHtmlDropIntent,
  parseAgentHtml,
  serializeAgentHtml,
  validateAgentHtml,
  type AgentHtmlDropIntent,
} from "@/agent-html"
import { inferAgentHtmlInteractionUnits } from "@/agent-html/interaction/infer-interaction-units"
import { renderAgentHtml, renderInteractiveAgentHtml } from "@/agent-html/runtime"
import { formatHtmlSource, getSourceMetrics } from "@/agent-html/source"
import {
  agentHtmlExampleCases,
  type AgentHtmlExampleCase,
  type AgentHtmlExampleLocale,
} from "@example/cases"
import type { ExampleThemeId } from "@example/theme/theme-presets"
import { createAgentHtmlBlockSummaryMap } from "@example/features/runtime-preview/block-summary"
import { RuntimeShell } from "@example/features/runtime-preview/runtime-shell"
import { ValidationErrors } from "@example/features/runtime-preview/validation-errors"

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
  return (
    <AgentHtmlRuntimePageSession
      activeCase={activeCase}
      key={activeCase.id}
      locale={locale}
      onLocaleChange={onLocaleChange}
      onThemeChange={onThemeChange}
      theme={theme}
    />
  )
}

function AgentHtmlRuntimePageSession({
  activeCase,
  locale,
  onLocaleChange,
  onThemeChange,
  theme,
}: {
  activeCase: AgentHtmlExampleCase
  locale: AgentHtmlExampleLocale
  onLocaleChange: (locale: AgentHtmlExampleLocale) => void
  onThemeChange: (theme: ExampleThemeId) => void
  theme: ExampleThemeId
}) {
  const [runtimeState, setRuntimeState] = React.useState(() =>
    createRuntimeDocumentState(activeCase.artifactSource)
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
  }, [activeCase.reactSource, debugRuntime, runtimeState])

  const htmlMetrics = React.useMemo(() => {
    return runtime.htmlSource ? getSourceMetrics(runtime.htmlSource) : undefined
  }, [runtime.htmlSource])

  React.useEffect(() => {
    if (!deferredHtmlDocument) {
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
      ? renderInteractiveAgentHtml(runtime.document, {
          interactionUnits: runtime.interactionUnits ?? undefined,
        })
      : null
  }, [runtime])

  return (
    <AgentHtmlBlockRuntimeProvider onDropIntent={handleDropIntent}>
      <RuntimeShell
        ahtmlMetrics={runtime.ahtmlMetrics}
        artifactSource={runtimeState.source}
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
