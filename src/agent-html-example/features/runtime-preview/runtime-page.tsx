import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import {
  formatHtmlSource,
  getAgentHtmlElementByPath,
  getSourceMetrics,
  inferAgentHtmlInteractionUnits,
  parseAgentHtml,
  renderAgentHtml,
  serializeAgentHtmlNode,
  validateAgentHtml,
} from "@/agent-html"
import type { BlockCodeSnippet } from "@/agent-html-example/features/runtime-preview/block-code-inspector"
import { agentHtmlExampleCases } from "@/agent-html-example/cases"
import type { ExampleThemeId } from "@/agent-html-example/theme/theme-presets"
import { RuntimeShell } from "@/agent-html-example/features/runtime-preview/runtime-shell"
import { ValidationErrors } from "@/agent-html-example/features/runtime-preview/validation-errors"

const activeCase = agentHtmlExampleCases[0]

function buildBlockCodeSnippets(
  document: ReturnType<typeof parseAgentHtml>,
  blockPaths: string[]
) {
  return new Map(
    blockPaths.flatMap((path): [string, BlockCodeSnippet][] => {
      const node = getAgentHtmlElementByPath(document.root, path)

      if (!node) {
        return []
      }

      return [
        [
          path,
          {
            ahtml: serializeAgentHtmlNode(node),
            path,
          },
        ],
      ]
    })
  )
}

export function AgentHtmlRuntimePage({
  onThemeChange,
  theme,
}: {
  onThemeChange: (theme: ExampleThemeId) => void
  theme: ExampleThemeId
}) {
  const [hoveredBlockPath, setHoveredBlockPath] = React.useState<string | null>(
    null
  )
  const [isInspectorHovered, setIsInspectorHovered] = React.useState(false)
  const hideTimerRef = React.useRef<number | null>(null)

  const runtime = React.useMemo(() => {
    const document = parseAgentHtml(activeCase.ahtmlSource)
    const validation = validateAgentHtml(document)
    const interactionUnits = validation.ok
      ? inferAgentHtmlInteractionUnits(document)
      : null
    const blockCodeByPath = interactionUnits
      ? buildBlockCodeSnippets(
          document,
          interactionUnits.blocks.map((unit) => unit.path)
        )
      : new Map<string, BlockCodeSnippet>()
    const sourceContent = validation.ok ? renderAgentHtml(document) : null
    const htmlSource = sourceContent
      ? formatHtmlSource(renderToStaticMarkup(sourceContent))
      : ""

    return {
      ahtmlMetrics: getSourceMetrics(activeCase.ahtmlSource),
      blockCodeByPath,
      document,
      htmlMetrics: getSourceMetrics(htmlSource),
      htmlSource,
      interactionUnits,
      reactMetrics: getSourceMetrics(activeCase.reactSource),
      validation,
    }
  }, [])

  const activeBlockCode = hoveredBlockPath
    ? runtime.blockCodeByPath.get(hoveredBlockPath) ?? null
    : null

  const scheduleHide = React.useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current)
    }

    hideTimerRef.current = window.setTimeout(() => {
      if (!isInspectorHovered) {
        setHoveredBlockPath(null)
      }
    }, 140)
  }, [isInspectorHovered])

  const handleBlockHover = React.useCallback(
    (path: string | null) => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }

      if (path) {
        setHoveredBlockPath(path)
        return
      }

      scheduleHide()
    },
    [scheduleHide]
  )

  const handleInspectorHoverChange = React.useCallback(
    (hovering: boolean) => {
      setIsInspectorHovered(hovering)

      if (!hovering) {
        scheduleHide()
      }
    },
    [scheduleHide]
  )

  React.useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current)
      }
    }
  }, [])

  const renderedContent = React.useMemo(() => {
    return runtime.validation.ok
      ? renderAgentHtml(runtime.document, {
          highlightBlocks: true,
          interactionUnits: runtime.interactionUnits ?? undefined,
          onBlockHover: handleBlockHover,
        })
      : null
  }, [handleBlockHover, runtime])

  return (
    <RuntimeShell
      ahtmlMetrics={runtime.ahtmlMetrics}
      activeBlockCode={activeBlockCode}
      ahtmlSource={activeCase.ahtmlSource}
      htmlMetrics={runtime.htmlMetrics}
      htmlSource={runtime.htmlSource}
      reactMetrics={runtime.reactMetrics}
      reactSource={activeCase.reactSource}
      onInspectorHoverChange={handleInspectorHoverChange}
      onThemeChange={onThemeChange}
      theme={theme}
    >
      {renderedContent ? (
        renderedContent
      ) : (
        <ValidationErrors errors={runtime.validation.errors} />
      )}
    </RuntimeShell>
  )
}
