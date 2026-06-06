import type { AgentHtmlDocument } from "@/agent-html/ast/types"
import { inferAgentHtmlInteractionUnits } from "@/agent-html/interaction/infer-interaction-units"
import type { AgentHtmlInteractionUnits } from "@/agent-html/interaction/types"
import { AgentHtmlBlockWrapper } from "@/agent-html/runtime/block/block-wrapper"
import { renderAgentHtml } from "@/agent-html/runtime/render/render-agent-html"

export function renderInteractiveAgentHtml(
  document: AgentHtmlDocument,
  options: {
    interactionUnits?: AgentHtmlInteractionUnits
  } = {}
) {
  const interactionUnits =
    options.interactionUnits ?? inferAgentHtmlInteractionUnits(document)

  return renderAgentHtml(document, {
    highlightBlocks: true,
    interactionUnits,
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
}
