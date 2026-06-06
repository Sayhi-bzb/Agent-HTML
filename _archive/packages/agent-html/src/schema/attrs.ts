import type { AgentHtmlTag } from "@/agent-html/ast/types"
import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import {
  deriveAllowedAttrs,
  deriveRequiredAttrs,
} from "@/agent-html/schema/derive"

export const allowedAttrs: Partial<Record<AgentHtmlTag, string[]>> =
  deriveAllowedAttrs(agentHtmlComponentRegistry)

export const requiredAttrs: Partial<Record<AgentHtmlTag, string[]>> =
  deriveRequiredAttrs(agentHtmlComponentRegistry)

