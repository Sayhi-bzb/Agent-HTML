export type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
  AgentHtmlTag,
  AgentHtmlTextNode,
} from "@/agent-html/ast/types"
export {
  walkAgentHtmlElementPaths,
} from "@/agent-html/ast/paths"
export { serializeAgentHtml } from "@/agent-html/ast/serialize-agent-html"
export { applyAgentHtmlDropIntent } from "@/agent-html/edit/apply-drop-intent"
export type {
  AgentHtmlDropIntent,
  ApplyAgentHtmlDropIntentInput,
} from "@/agent-html/edit/types"
export { formatHtmlSource } from "@/agent-html/runtime/format-html-source"
export { inferAgentHtmlInteractionUnits } from "@/agent-html/interaction/infer-interaction-units"
export type {
  AgentHtmlInteractionDiagnostics,
  AgentHtmlInteractionUnit,
  AgentHtmlInteractionUnitKind,
  AgentHtmlInteractionUnits,
  AgentHtmlNestedInteractionBlock,
} from "@/agent-html/interaction/types"
export { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
export { renderAgentHtml } from "@/agent-html/runtime/render/render-agent-html"
export {
  AgentHtmlRuntimeTheme,
  type AgentHtmlColorCssVariables,
} from "@/agent-html/runtime/runtime-theme"
export {
  AgentHtmlBlockHandle,
  AgentHtmlBlockIndicator,
  AgentHtmlBlockRuntimeProvider,
  AgentHtmlBlockWrapper,
  agentHtmlBlockWrapperClassName,
  useAgentHtmlBlockRuntime,
  type AgentHtmlBlockDropIndicator,
  type AgentHtmlBlockRuntimeState,
} from "@/agent-html/runtime/block"
export {
  getSourceMetrics,
  type SourceMetrics,
} from "@/agent-html/runtime/source-metrics"
export {
  agentHtmlColorTokenDefaults,
  type AgentHtmlColorFamily,
  type AgentHtmlColorTokenValues,
} from "@/agent-html/theme/defaults"
export {
  validateAgentHtml,
} from "@/agent-html/validate/validate-agent-html"
export type { AgentHtmlValidationError } from "@/agent-html/validate/error-codes"
