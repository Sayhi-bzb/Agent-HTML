import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import { derivePromptGrammarLines } from "@/agent-html/schema/derive"
import type { AgentHtmlComponentContract } from "@/agent-html/schema/component-contract"

function replacePromptSection(
  source: string,
  title: string,
  lines: readonly string[]
) {
  const normalizedSource = source.replace(/\r\n/g, "\n")
  const pattern = new RegExp(`(## ${title}\\n\\n)(.*?)(\\n\\n## )`, "s")

  return normalizedSource.replace(pattern, `$1${lines.join("\n")}$3`)
}

export function buildAgentHtmlPromptGrammar({
  registry = agentHtmlComponentRegistry,
}: {
  registry?: readonly AgentHtmlComponentContract[]
} = {}) {
  return {
    layout: derivePromptGrammarLines(registry, "layout"),
    ui: derivePromptGrammarLines(registry, "ui"),
  }
}

export function buildAgentHtmlPromptDocument(
  sourcePrompt: string,
  options: {
    registry?: readonly AgentHtmlComponentContract[]
  } = {}
) {
  const grammar = buildAgentHtmlPromptGrammar(options)

  return replacePromptSection(
    replacePromptSection(sourcePrompt, "Layout", grammar.layout),
    "UI",
    grammar.ui
  )
}
