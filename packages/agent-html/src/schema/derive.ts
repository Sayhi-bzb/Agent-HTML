import type { AgentHtmlTag } from "@/agent-html/ast/types"
import type {
  AgentHtmlAttrContract,
  AgentHtmlComponentContract,
} from "@/agent-html/schema/component-contract"

function isPromptAttr(attr: AgentHtmlAttrContract) {
  return attr.prompt !== false
}

function formatAttr(name: string, attr: AgentHtmlAttrContract) {
  const requiredMarker = attr.required ? "" : "?"

  if (attr.values && attr.values.length > 0) {
    return `${name}${requiredMarker}="${attr.values.join("|")}"`
  }

  return `${name}${requiredMarker}=${attr.type}`
}

export function deriveLayoutTags(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return new Set<AgentHtmlTag>(
    contracts
      .filter((contract) => contract.kind === "layout")
      .map((contract) => contract.tag)
  )
}

export function deriveAllTags(contracts: readonly AgentHtmlComponentContract[]) {
  return new Set<AgentHtmlTag>(contracts.map((contract) => contract.tag))
}

export function deriveAllowedAttrs(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return Object.fromEntries(
    contracts
      .filter((contract) => contract.attrs)
      .map((contract) => [contract.tag, Object.keys(contract.attrs ?? {})])
  ) as Partial<Record<AgentHtmlTag, string[]>>
}

export function deriveRequiredAttrs(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return Object.fromEntries(
    contracts
      .map((contract) => [
        contract.tag,
        Object.entries(contract.attrs ?? {})
          .filter(([, attr]) => attr.required === true)
          .map(([name]) => name),
      ])
      .filter(([, attrs]) => attrs.length > 0)
  ) as Partial<Record<AgentHtmlTag, string[]>>
}

export function deriveDefaultAttrs(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return Object.fromEntries(
    contracts
      .map((contract) => [
        contract.tag,
        Object.fromEntries(
          Object.entries(contract.attrs ?? {})
            .filter(([, attr]) => attr.defaultValue !== undefined)
            .map(([name, attr]) => [name, attr.defaultValue])
        ),
      ])
      .filter(([, attrs]) => Object.keys(attrs).length > 0)
  ) as Partial<Record<AgentHtmlTag, Record<string, string>>>
}

export function derivePromptGrammarLines(
  contracts: readonly AgentHtmlComponentContract[],
  kind: "layout" | "ui"
) {
  return contracts
    .filter((contract) => contract.kind === kind)
    .map((contract) => {
      if (contract.promptSignature) {
        return `- \`${contract.promptSignature} -> ${contract.children.grammar}\``
      }

      const attrs = Object.entries(contract.attrs ?? {})
        .filter(([, attr]) => isPromptAttr(attr))
        .map(([name, attr]) => formatAttr(name, attr))
      const attrText = attrs.length > 0 ? `:${attrs.join(", ")}` : ""

      return `- \`${contract.tag}${attrText} -> ${contract.children.grammar}\``
    })
}
