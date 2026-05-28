import { agentHtmlComponentRegistry } from "@/agent-html/schema/component-registry"
import { derivePromptGrammarLines } from "@/agent-html/schema/derive"

function replacePromptSection(
  source: string,
  title: string,
  lines: readonly string[]
) {
  const normalizedSource = source.replace(/\r\n/g, "\n")
  const pattern = new RegExp(`(## ${title}\\n\\n)(.*?)(\\n\\n## )`, "s")

  return normalizedSource.replace(pattern, `$1${lines.join("\n")}$3`)
}

export function buildAgentHtmlPromptGrammar() {
  return {
    layout: derivePromptGrammarLines(agentHtmlComponentRegistry, "layout"),
    ui: derivePromptGrammarLines(agentHtmlComponentRegistry, "ui"),
  }
}

export function buildAgentHtmlPromptDocument(sourcePrompt: string) {
  const grammar = buildAgentHtmlPromptGrammar()

  return replacePromptSection(
    replacePromptSection(sourcePrompt, "Layout", grammar.layout),
    "UI",
    grammar.ui
  )
}
