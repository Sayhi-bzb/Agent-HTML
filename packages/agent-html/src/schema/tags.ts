import type { AgentHtmlTag } from "@/agent-html/ast/types"
import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import {
  deriveAllTags,
  deriveLayoutTags,
} from "@/agent-html/schema/derive"

export const layoutTags: Set<AgentHtmlTag> = deriveLayoutTags(
  agentHtmlComponentRegistry
)

export const allTags: Set<AgentHtmlTag> = deriveAllTags(
  agentHtmlComponentRegistry
)

