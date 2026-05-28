import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import { derivePromptGrammarLines } from "@/agent-html/schema/derive"

export function buildAgentHtmlPromptGrammar() {
  return {
    layout: derivePromptGrammarLines(agentHtmlComponentRegistry, "layout"),
    ui: derivePromptGrammarLines(agentHtmlComponentRegistry, "ui"),
  }
}
